import { NextRequest, NextResponse } from 'next/server';
import {
  generateExcelReport,
  generateComparisonExcelReport,
  generateReportFilename,
  validateReportData,
} from '@/services/reportGenerator';
import { GenerateReportRequest, TaxReport } from '@/types';

export const maxDuration = 30;

/**
 * POST /api/generate-report
 * Generates and downloads Excel report
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const { reportData, comparisonReports, isComparison } = body as {
      reportData: TaxReport;
      comparisonReports?: Array<{ date: string; data: TaxReport }>;
      isComparison?: boolean;
    };

    if (!reportData && !comparisonReports) {
      return NextResponse.json(
        { error: 'Report data is required' },
        { status: 400 }
      );
    }

    let buffer: Buffer;
    let filename: string;

    if (isComparison && comparisonReports && comparisonReports.length > 0) {
      // Generate comparison report
      console.log('Generating comparison Excel report...');
      buffer = generateComparisonExcelReport(comparisonReports);
      filename = `crypto-tax-comparison-${new Date().toISOString().split('T')[0]}.xlsx`;
    } else {
      // Validate report data
      try {
        validateReportData(reportData);
      } catch (error) {
        return NextResponse.json(
          {
            error:
              error instanceof Error
                ? error.message
                : 'Invalid report data',
          },
          { status: 400 }
        );
      }

      // Generate single date Excel file
      console.log('Generating Excel report...');
      buffer = generateExcelReport(reportData);

      // Generate filename
      filename = generateReportFilename(reportData.reportDate);
    }

    // Return file as download
    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating report:', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate report',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/generate-report
 * Returns API information
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    name: 'Generate Report API',
    version: '1.0.0',
    description: 'Generates downloadable Excel tax report',
    usage: {
      method: 'POST',
      body: {
        reportData: 'TaxReport object from analyze-wallets endpoint',
      },
    },
  });
}

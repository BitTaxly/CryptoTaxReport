import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TaxReport } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reportData, comparisonReports, isComparison } = body as {
      reportData: TaxReport;
      comparisonReports?: Array<{ date: string; data: TaxReport }>;
      isComparison?: boolean;
    };

    if (!reportData) {
      return NextResponse.json(
        { error: 'No report data provided' },
        { status: 400 }
      );
    }

    // Create PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Add title
    doc.setFontSize(20);
    doc.setTextColor(26, 115, 232); // Primary color
    const title = isComparison ? 'Crypto Tax Portfolio Comparison Report' : 'Crypto Tax Portfolio Report';
    doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    if (isComparison && comparisonReports && comparisonReports.length > 0) {
      // Generate comparison report
      for (let i = 0; i < comparisonReports.length; i++) {
        const report = comparisonReports[i];
        const reportDate = new Date(report.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        // Add page for each date if not first
        if (i > 0) {
          doc.addPage();
          yPosition = 20;
        }

        // Date header
        doc.setFontSize(16);
        doc.setTextColor(60, 64, 67);
        doc.text(`Report Date: ${reportDate}`, 14, yPosition);
        yPosition += 10;

        // Calculate growth
        if (i > 0) {
          const prevTotal = comparisonReports[i - 1].data.grandTotal;
          const currentTotal = report.data.grandTotal;
          const growthPercent = ((currentTotal - prevTotal) / prevTotal) * 100;
          const growthText = `Growth: ${growthPercent >= 0 ? '+' : ''}${growthPercent.toFixed(2)}%`;

          doc.setFontSize(12);
          const growthColor = growthPercent >= 0 ? [30, 142, 62] : [217, 48, 37];
          doc.setTextColor(growthColor[0], growthColor[1], growthColor[2]);
          doc.text(growthText, 14, yPosition);
          yPosition += 10;
        }

        // Grand total
        doc.setFontSize(14);
        doc.setTextColor(60, 64, 67);
        doc.text(`Total Portfolio Value: $${report.data.grandTotal.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`, 14, yPosition);
        yPosition += 12;

        // Wallet details table
        for (const wallet of report.data.wallets) {
          // Check if we need a new page
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }

          // Wallet header
          doc.setFontSize(12);
          doc.setTextColor(60, 64, 67);
          doc.text(`${wallet.blockchain.toUpperCase()} Wallet`, 14, yPosition);
          yPosition += 6;

          doc.setFontSize(10);
          doc.setTextColor(95, 99, 104);
          doc.text(wallet.walletAddress, 14, yPosition);
          yPosition += 8;

          // Tokens table
          const tableData = wallet.tokens.map(token => [
            token.tokenSymbol,
            token.balance.toLocaleString('en-US', { maximumFractionDigits: 4 }),
            `$${token.priceAtDate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`,
            `$${token.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          ]);

          autoTable(doc, {
            startY: yPosition,
            head: [['Token', 'Balance', 'Price (USD)', 'Total Value (USD)']],
            body: tableData,
            foot: [[
              'Wallet Total',
              '',
              '',
              `$${wallet.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            ]],
            theme: 'striped',
            headStyles: {
              fillColor: [102, 126, 234],
              textColor: [255, 255, 255],
              fontStyle: 'bold',
              fontSize: 10,
            },
            footStyles: {
              fillColor: [232, 234, 237],
              textColor: [60, 64, 67],
              fontStyle: 'bold',
              fontSize: 10,
            },
            bodyStyles: {
              fontSize: 9,
              textColor: [60, 64, 67],
            },
            alternateRowStyles: {
              fillColor: [248, 249, 250],
            },
            margin: { left: 14, right: 14 },
          });

          yPosition = (doc as any).lastAutoTable.finalY + 10;
        }
      }
    } else {
      // Generate single date report
      const reportDate = new Date(reportData.reportDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // Date
      doc.setFontSize(12);
      doc.setTextColor(95, 99, 104);
      doc.text(`Report Date: ${reportDate}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Grand total
      doc.setFontSize(16);
      doc.setTextColor(60, 64, 67);
      doc.text(`Total Portfolio Value: $${reportData.grandTotal.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // Wallet details
      for (const wallet of reportData.wallets) {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        // Wallet header
        doc.setFontSize(14);
        doc.setTextColor(60, 64, 67);
        doc.text(`${wallet.blockchain.toUpperCase()} Wallet`, 14, yPosition);
        yPosition += 6;

        doc.setFontSize(10);
        doc.setTextColor(95, 99, 104);
        doc.text(wallet.walletAddress, 14, yPosition);
        yPosition += 8;

        // Tokens table
        const tableData = wallet.tokens.map(token => [
          token.tokenSymbol,
          token.balance.toLocaleString('en-US', { maximumFractionDigits: 4 }),
          `$${token.priceAtDate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`,
          `$${token.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [['Token', 'Balance', 'Price (USD)', 'Total Value (USD)']],
          body: tableData,
          foot: [[
            'Wallet Total',
            '',
            '',
            `$${wallet.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          ]],
          theme: 'striped',
          headStyles: {
            fillColor: [102, 126, 234],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10,
          },
          footStyles: {
            fillColor: [232, 234, 237],
            textColor: [60, 64, 67],
            fontStyle: 'bold',
            fontSize: 10,
          },
          bodyStyles: {
            fontSize: 9,
            textColor: [60, 64, 67],
          },
          alternateRowStyles: {
            fillColor: [248, 249, 250],
          },
          margin: { left: 14, right: 14 },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }
    }

    // Add footer with timestamp and branding
    const pageCount = doc.getNumberOfPages();
    const pageHeight = doc.internal.pageSize.getHeight();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Timestamp and page number (center)
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Generated on ${new Date().toLocaleString('en-US')} | Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );

      // Professional disclaimer (center, smaller)
      doc.setFontSize(7);
      doc.setTextColor(170, 170, 170);
      doc.text(
        'This report is generated for informational purposes. Consult a tax professional for official filings.',
        pageWidth / 2,
        pageHeight - 6,
        { align: 'center' }
      );

      // BitTaxly branding (bottom right corner, subtle)
      doc.setFontSize(7);
      doc.setTextColor(180, 180, 180);
      doc.text(
        'Created with BitTaxly',
        pageWidth - 14,
        pageHeight - 6,
        { align: 'right' }
      );
    }

    // Generate PDF buffer
    const pdfBuffer = doc.output('arraybuffer');

    // Return PDF
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="crypto-tax-report.pdf"',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF report' },
      { status: 500 }
    );
  }
}

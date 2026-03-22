# Blockchain Logos

Place blockchain logo SVG files in this directory:

## Required Files

- `solana.svg` - Solana logo
- `ethereum.svg` - Ethereum logo
- `unknown.svg` - Fallback logo for unknown chains

## Logo Sources

You can download official logos from:

### Solana
- [Solana Brand Assets](https://solana.com/branding)
- Recommended: Use the "S" icon mark

### Ethereum
- [Ethereum Brand Assets](https://ethereum.org/en/assets/)
- Recommended: Use the diamond logo

### Creating Unknown Logo

Create a simple SVG placeholder:

```svg
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <circle cx="16" cy="16" r="14" fill="#9CA3AF"/>
  <text x="16" y="21" text-anchor="middle" font-size="18" fill="white" font-weight="bold">?</text>
</svg>
```

## Size Guidelines

- Recommended size: 32x32px or 64x64px
- Format: SVG (preferred) or PNG
- Background: Transparent

## Usage

Logos are automatically displayed next to wallet addresses based on detected blockchain type.

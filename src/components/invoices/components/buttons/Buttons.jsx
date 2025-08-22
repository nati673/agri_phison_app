import { handleDownload } from 'utils/invoice.helper';
import { Button, Stack } from '@mui/material';
// Optionally, import MUI icons or keep your SVGs
// import PrintIcon from '@mui/icons-material/Print';
// import DownloadIcon from '@mui/icons-material/Download';

export default function Buttons({ invoicePage }) {
  return (
    <Stack direction="row" spacing={2} sx={{ mb: 2 }} className="tm_hide_print">
      {/* Print Button */}

      {/* Download Button */}
      <Button
        variant="contained"
        color="secondary"
        startIcon={
          // Use MUI DownloadIcon or your custom SVG below
          // <DownloadIcon />
          <span className="tm_btn_icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512">
              <path
                d="M320 336h76c55 0 100-21.21 100-75.6s-53-73.47-96-75.6C391.11 99.74 329 48 256 48c-69 0-113.44 45.79-128 91.2-60 5.7-112 35.88-112 98.4S70 336 136 336h56M192 400.1l64 63.9 64-63.9M256 224v224.03"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={32}
              />
            </svg>
          </span>
        }
        onClick={() => handleDownload(invoicePage)}
        id="tm_download_btn"
      >
        Download
      </Button>
    </Stack>
  );
}

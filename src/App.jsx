import React, { useState, useEffect, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Box,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Checkbox,
  CssBaseline,
  FormControlLabel,
  Stack,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { QRCodeSVG } from 'qrcode.react';
import { svg2pdf } from 'svg2pdf.js';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, ImageRun } from 'docx';
import { useTranslation } from 'react-i18next';
import QRHistory from './QRHistory';
import AdPlaceholder from './AdPlaceholder';
import DrawerMenu from './DrawerMenu';
import './i18n';

function App() {
  const { t, i18n } = useTranslation();

  // Generator states
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [encryption, setEncryption] = useState('WPA');
  const [isHidden, setIsHidden] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [history, setHistory] = useState([]);

  // Settings state (using defaults)
  const defaultSettings = {
    language: 'en',
    displayGenerator: true,
    displayHistory: true,
    downloadButtons: {
      pdf: true,
      png: true,
      docx: true,
      svg: true,
    },
    dynamicUrlParams: false,
  };
  const [appSettings, setAppSettings] = useState(defaultSettings);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const qrRef = useRef(null);

  // Load settings, history, and URL parameters on startup
  useEffect(() => {
    const storedSettings = localStorage.getItem('appSettings');
    if (storedSettings) {
      const parsedSettings = JSON.parse(storedSettings);
      setAppSettings(parsedSettings);
      i18n.changeLanguage(parsedSettings.language || 'en');
    }
    const storedHistory = localStorage.getItem('qrHistory');
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
    const params = new URLSearchParams(window.location.search);
    const urlSsid = params.get('ssid');
    const urlPassword = params.get('password');
    const urlEncryption = params.get('encryption');
    const urlIsHidden = params.get('isHidden');
    const urlLang = params.get('lang');

    if (urlSsid !== null) setSsid(urlSsid);
    if (urlPassword !== null) setPassword(urlPassword);
    if (urlEncryption !== null) setEncryption(urlEncryption);
    if (urlIsHidden !== null) setIsHidden(urlIsHidden === 'true');
    if (urlLang !== null) {
      setAppSettings(prev => ({ ...prev, language: urlLang }));
      i18n.changeLanguage(urlLang);
    }

    const urlDisplayGenerator = params.get('displayGenerator');
    const urlDisplayHistory = params.get('displayHistory');
    const urlDynamicUrlParams = params.get('dynamicUrlParams');
    const urlDownloadPDF = params.get('downloadPDF');
    const urlDownloadPNG = params.get('downloadPNG');
    const urlDownloadDOCX = params.get('downloadDOCX');
    const urlDownloadSVG = params.get('downloadSVG');

    setAppSettings(prev => ({
      ...prev,
      displayGenerator: urlDisplayGenerator !== null ? urlDisplayGenerator === 'true' : prev.displayGenerator,
      displayHistory: urlDisplayHistory !== null ? urlDisplayHistory === 'true' : prev.displayHistory,
      dynamicUrlParams: urlDynamicUrlParams !== null ? urlDynamicUrlParams === 'true' : prev.dynamicUrlParams,
      downloadButtons: {
        pdf: urlDownloadPDF !== null ? urlDownloadPDF === 'true' : prev.downloadButtons.pdf,
        png: urlDownloadPNG !== null ? urlDownloadPNG === 'true' : prev.downloadButtons.png,
        docx: urlDownloadDOCX !== null ? urlDownloadDOCX === 'true' : prev.downloadButtons.docx,
        svg: urlDownloadSVG !== null ? urlDownloadSVG === 'true' : prev.downloadButtons.svg,
      },
    }));

    if (urlDynamicUrlParams !== null && urlDynamicUrlParams === 'false') {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [i18n]);

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(appSettings));
    updateUrlParameters();
  }, [appSettings, ssid, password, encryption, isHidden]);

  const updateUrlParameters = () => {
    if (!appSettings.dynamicUrlParams) {
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }
    const params = new URLSearchParams();
    if (ssid !== '') params.set('ssid', ssid);
    if (password !== '') params.set('password', password);
    if (encryption !== 'WPA') params.set('encryption', encryption);
    if (isHidden !== false) params.set('isHidden', isHidden.toString());
    if (appSettings.language !== 'en') params.set('lang', appSettings.language);
    if (appSettings.displayGenerator !== true)
      params.set('displayGenerator', appSettings.displayGenerator.toString());
    if (appSettings.displayHistory !== true)
      params.set('displayHistory', appSettings.displayHistory.toString());
    if (appSettings.downloadButtons.pdf !== true)
      params.set('downloadPDF', appSettings.downloadButtons.pdf.toString());
    if (appSettings.downloadButtons.png !== true)
      params.set('downloadPNG', appSettings.downloadButtons.png.toString());
    if (appSettings.downloadButtons.docx !== true)
      params.set('downloadDOCX', appSettings.downloadButtons.docx.toString());
    if (appSettings.downloadButtons.svg !== true)
      params.set('downloadSVG', appSettings.downloadButtons.svg.toString());

    const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', newUrl);
  };

  const generateQRCode = () => {
    const wifiConfig = `WIFI:T:${encryption};S:${ssid};P:${password};${isHidden ? 'H:true;' : ''};`;
    setQrValue(wifiConfig);

    const newEntry = {
      id: Date.now(),
      ssid,
      password,
      encryption,
      isHidden,
      qrValue: wifiConfig,
    };
    const updatedHistory = [newEntry, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('qrHistory', JSON.stringify(updatedHistory));
  };

  const handleLoadHistory = (entry) => {
    setSsid(entry.ssid);
    setPassword(entry.password);
    setEncryption(entry.encryption);
    setIsHidden(entry.isHidden);
    setQrValue(entry.qrValue);
  };

  const handleDownloadSVG = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "wifi-qr.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPNG = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svg);
    if (!svgString.match(/^<\?xml/)) {
      svgString = '<?xml version="1.0" standalone="no"?>\r\n' + svgString;
    }
    const svgDataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = "wifi-qr.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    image.onerror = function (err) {
      console.error("Error converting SVG to PNG:", err);
    };
    image.src = svgDataUrl;
  };

  const handleDownloadDOCX = async () => {
    if (!qrRef.current) return;
    try {
      // Serialize the SVG element.
      const svg = qrRef.current.querySelector("svg");
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svg);
      if (!svgString.startsWith("<?xml")) {
        svgString = '<?xml version="1.0" standalone="no"?>\n' + svgString;
      }
      const svgDataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
  
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = async () => {
        // Create a fixed-size canvas.
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext("2d");
        // Fill with white background.
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw the SVG image scaled to fill the canvas.
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  
        // Use toDataURL to get a base64 PNG string.
        const dataUrl = canvas.toDataURL("image/png");
        const base64String = dataUrl.split(",")[1];
  
        // Decode the base64 string into a Uint8Array.
        const binaryString = window.atob(base64String);
        const len = binaryString.length;
        const uint8Data = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          uint8Data[i] = binaryString.charCodeAt(i);
        }
  
        // Create the DOCX document with the PNG embedded.
        const doc = new Document({
          sections: [
            {
              properties: {},
              children: [
                new Paragraph({
                  children: [new TextRun({ text: `SSID: ${ssid}`, bold: true })],
                }),
                new Paragraph({
                  children: [new TextRun({ text: `Password: ${password}`, bold: true })],
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: uint8Data,
                      transformation: { width: 512, height: 512 },
                      fileType: "png",
                    }),
                  ],
                }),
              ],
            },
          ],
        });
  
        const blobDoc = await Packer.toBlob(doc);
        const urlBlob = URL.createObjectURL(blobDoc);
        const link = document.createElement("a");
        link.href = urlBlob;
        link.download = "wifi-qr.docx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(urlBlob);
      };
      image.onerror = (err) => {
        console.error("Error converting SVG to image for DOCX:", err);
      };
      image.src = svgDataUrl;
    } catch (error) {
      console.error("Error generating DOCX:", error);
    }
  };  

  const handleDownloadPDF = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });
    
    // Use svg2pdf to directly embed the SVG as vector graphics
    svg2pdf(svg, pdf, { x: 40, y: 100, width: 256, height: 256 })
      .then(() => {
        pdf.setFontSize(16);
        pdf.text(`${t('networkName')}: ${ssid}`, 40, 40);
        pdf.text(`${t('password')}: ${password}`, 40, 70);
        pdf.save('wifi-qr.pdf');
      })
      .catch((err) => {
        console.error('Error exporting PDF:', err);
      });
  };

  return (
    <>
      <CssBaseline />
      <AppBar position="sticky">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {t("appTitle")}
          </Typography>
        </Toolbar>
      </AppBar>
      <DrawerMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} settings={appSettings} setSettings={setAppSettings} />
      <Container sx={{ my: 4 }}>
        {/* When a QR code exists, display the generator and the QR code side-by-side on desktop */}
        {qrValue ? (
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2, mb: 4 }}>
            {appSettings.displayGenerator && (
              <Box sx={{ flex: 1, p: 2, border: "1px solid #ccc", borderRadius: 1 }}>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label={t("networkName")}
                    value={ssid}
                    onChange={(e) => setSsid(e.target.value)}
                    required
                    autoComplete="off"
                  />
                  <TextField
                    fullWidth
                    label={t("password")}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="off"
                  />
                  <FormControl fullWidth>
                    <InputLabel>{t("encryption")}</InputLabel>
                    <Select value={encryption} label={t("encryption")} onChange={(e) => setEncryption(e.target.value)}>
                      <MenuItem value="WPA">WPA/WPA2</MenuItem>
                      <MenuItem value="WEP">WEP</MenuItem>
                      <MenuItem value="nopass">{t("none")}</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControlLabel
                    control={<Checkbox checked={isHidden} onChange={(e) => setIsHidden(e.target.checked)} />}
                    label={t("hiddenNetwork")}
                  />
                  <Button variant="contained" onClick={generateQRCode} disabled={!ssid || !password}>
                    {t("generateQRCode")}
                  </Button>
                </Stack>
              </Box>
            )}
            <Box sx={{ flex: 1, p: 2, border: "1px solid #ccc", borderRadius: 1, textAlign: "center" }}>
              <Box ref={qrRef} sx={{ display: "inline-block", p: 2, backgroundColor: "white" }}>
                <QRCodeSVG value={qrValue} size={256} level="H" />
              </Box>
              <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                {appSettings.downloadButtons.svg && (
                  <Button variant="outlined" onClick={handleDownloadSVG}>
                    {t("downloadSVG")}
                  </Button>
                )}
                {appSettings.downloadButtons.png && (
                  <Button variant="outlined" onClick={handleDownloadPNG}>
                    {t("downloadPNG")}
                  </Button>
                )}
                {appSettings.downloadButtons.docx && (
                  <Button variant="outlined" onClick={handleDownloadDOCX}>
                    {t("exportDOCX")}
                  </Button>
                )}
                {appSettings.downloadButtons.pdf && (
                  <Button variant="outlined" onClick={handleDownloadPDF}>
                    {t("exportPDF")}
                  </Button>
                )}
              </Stack>
            </Box>
          </Box>
        ) : (
          // If no QR code exists, only display the generator (if enabled).
          appSettings.displayGenerator && (
            <Box sx={{ mb: 4, p: 2, border: "1px solid #ccc", borderRadius: 1 }}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label={t("networkName")}
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  required
                  autoComplete="off"
                />
                <TextField
                  fullWidth
                  label={t("password")}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="off"
                />
                <FormControl fullWidth>
                  <InputLabel>{t("encryption")}</InputLabel>
                  <Select value={encryption} label={t("encryption")} onChange={(e) => setEncryption(e.target.value)}>
                    <MenuItem value="WPA">WPA/WPA2</MenuItem>
                    <MenuItem value="WEP">WEP</MenuItem>
                    <MenuItem value="nopass">{t("none")}</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={<Checkbox checked={isHidden} onChange={(e) => setIsHidden(e.target.checked)} />}
                  label={t("hiddenNetwork")}
                />
                <Button variant="contained" onClick={generateQRCode} disabled={!ssid || !password}>
                  {t("generateQRCode")}
                </Button>
              </Stack>
            </Box>
          )
        )}

        {appSettings.displayHistory && history.length > 0 && (
          <>
            <Box sx={{ mb: 4 }}>
              <AdPlaceholder />
            </Box>
            <QRHistory history={history} onSelect={handleLoadHistory} />
          </>
        )}

        <Box sx={{ mt: 4 }}>
          <AdPlaceholder />
        </Box>
      </Container>
    </>
  );
}

export default App;

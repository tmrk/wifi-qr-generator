import React from 'react';
import { Box, Link, Paper, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';

const STEPS = ['aboutStep1', 'aboutStep2', 'aboutStep3'];
const FAQ = ['aboutFaq1', 'aboutFaq2', 'aboutFaq3', 'aboutFaq4'];

// Short help, collapsed. The same text (in English) is in index.html for crawlers.
const About = () => {
  const { t } = useTranslation();

  return (
    <Paper
      variant="outlined"
      component="details"
      sx={{
        '& > summary': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 56,
          px: { xs: 2, sm: 3 },
          cursor: 'pointer',
          listStyle: 'none',
          fontWeight: 700,
          fontSize: '1.125rem',
          letterSpacing: '-0.01em',
          borderRadius: 'inherit',
          userSelect: 'none',
        },
        '& > summary::-webkit-details-marker': { display: 'none' },
        '& .about-chevron': { transition: 'transform 200ms', color: 'text.secondary' },
        '&[open] .about-chevron': { transform: 'rotate(180deg)' },
      }}
    >
      <summary>
        <span>{t('aboutTitle')}</span>
        <ExpandMoreIcon className="about-chevron" aria-hidden="true" />
      </summary>
      <Box sx={{ px: { xs: 2, sm: 3 }, pb: 3, '& p': { m: 0 } }}>
        <Typography>{t('aboutIntro')}</Typography>
        <Typography variant="h3" sx={{ mt: 2.5, mb: 1, fontSize: '1rem', fontWeight: 700 }}>
          {t('aboutHowTitle')}
        </Typography>
        <Box component="ol" sx={{ m: 0, pl: 3, '& li + li': { mt: 0.5 } }}>
          {STEPS.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </Box>
        <Typography variant="h3" sx={{ mt: 2.5, mb: 1, fontSize: '1rem', fontWeight: 700 }}>
          {t('aboutFaqTitle')}
        </Typography>
        <Box component="dl" sx={{ m: 0 }}>
          {FAQ.map((key) => (
            <Box key={key} sx={{ '&:not(:first-of-type)': { mt: 1.5 } }}>
              <Box component="dt" sx={{ fontWeight: 600 }}>
                {t(`${key}q`)}
              </Box>
              <Box component="dd" sx={{ m: 0, color: 'text.secondary' }}>
                {t(`${key}a`)}
              </Box>
            </Box>
          ))}
        </Box>
        <Box sx={{ mt: 2 }}>
          <Link
            href={`${import.meta.env.BASE_URL}llms.txt`}
            sx={{ display: 'inline-flex', alignItems: 'center', minHeight: 44 }}
          >
            {t('aboutLinks')}
          </Link>
        </Box>
      </Box>
    </Paper>
  );
};

export default About;

const IS_CI = !!process.env.CI_JOB_ID;

const launch = {
  headless: false,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=egl'],
  slowMo: 50,
};

if (IS_CI) {
  launch.executablePath = '/usr/bin/chromium-browser';
}

module.exports = {
  launch,
  browserContext: 'incognito',
};

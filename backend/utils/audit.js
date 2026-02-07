const Application = require('../models/Application');
const Config = require('../models/Config');

exports.selectRandomAudits = async (month, year) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Get all approved applications for the month
  const applications = await Application.find({
    status: 'approved',
    createdAt: { $gte: startDate, $lte: endDate },
    auditStatus: 'not_selected',
  });

  // Get audit sampling rate
  const config = await Config.findOne({ key: 'auditSamplingRate' });
  const samplingRate = config?.value || 0.1; // 10%

  const sampleSize = Math.ceil(applications.length * samplingRate);

  // Randomly select applications
  const shuffled = applications.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, sampleSize);

  // Update audit status
  for (const app of selected) {
    app.auditStatus = 'selected';
    await app.save();
  }

  return selected;
};




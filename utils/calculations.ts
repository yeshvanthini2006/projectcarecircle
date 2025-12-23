
import { ServiceCategory, HelperType } from '../types';

export const calculatePayment = (
  category: ServiceCategory, 
  distanceKm: number, 
  hours: number = 1
): number => {
  switch (category) {
    case 'Basic':
      // STRICT RULE: If distance <= 4 km AND time <= 3 hours, task is FREE
      if (distanceKm <= 4 && hours <= 3) {
        return 0;
      }
      // Larger Basic tasks are PAID
      return (10 * distanceKm) + (50 * hours);
      
    case 'Technical':
      return 100 + (15 * distanceKm);
      
    case 'Personal':
      return 200 + (20 * distanceKm) + (100 * hours);
      
    default:
      return 0;
  }
};

export type CertTier = 'Bronze' | 'Silver' | 'Gold';

export const generateCertificatePDF = (
  helperName: string, 
  orgName: string, 
  totalTasks: number, 
  avgRating: number, 
  tier: CertTier,
  language: 'English' | 'Tamil'
) => {
  // @ts-ignore
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  const colors = {
    Gold: [184, 134, 11],
    Silver: [128, 128, 128],
    Bronze: [160, 82, 45]
  };

  const currentTierColor = colors[tier];

  doc.setDrawColor(currentTierColor[0], currentTierColor[1], currentTierColor[2]);
  doc.setLineWidth(5);
  doc.rect(5, 5, width - 10, height - 10);

  doc.setTextColor(currentTierColor[0], currentTierColor[1], currentTierColor[2]);
  doc.setFontSize(40);
  doc.setFont('times', 'bold');
  const title = language === 'English' ? 'CERTIFICATE OF EXCELLENCE' : 'சிறந்த சேவை சான்றிதழ்';
  doc.text(title, width / 2, 45, { align: 'center' });

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(18);
  doc.setFont('times', 'italic');
  doc.text(language === 'English' ? 'Honoring the compassionate service of' : 'இதன் மூலம் பாராட்டி சான்றளிக்கப்படுவது', width / 2, 65, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(36);
  doc.setFont('times', 'bold');
  doc.text(helperName.toUpperCase(), width / 2, 85, { align: 'center' });

  doc.setTextColor(80, 80, 80);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  const text = language === 'English' 
    ? `For reaching ${tier} Level in Elder Care through ${totalTasks} verified missions, maintaining a professional average rating of ${avgRating.toFixed(1)}/5.0.`
    : `முதியோர் பராமரிப்பில் ${totalTasks} பணிகளை வெற்றிகரமாக முடித்து, ${avgRating.toFixed(1)}/5.0 மதிப்பீட்டுடன் ${tier} நிலையை அடைந்தமைக்காக வழங்கப்படுகிறது.`;
  
  const splitText = doc.splitTextToSize(text, width - 60);
  doc.text(splitText, width / 2, 110, { align: 'center' });

  doc.save(`CareCircle_Certificate_${helperName.replace(/\s/g, '_')}.pdf`);
};

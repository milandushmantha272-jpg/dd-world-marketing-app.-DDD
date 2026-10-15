export interface QuickReplyTemplate {
  id: string;
  title: string;
  category: 'greeting' | 'govimithuru' | 'sayuru' | 'support' | 'callback' | 'activation' | 'closing';
  text: string;
  shortCode: string;
  language: 'sinhala' | 'english' | 'bilingual';
  tags: string[];
}

export interface QuickReplyCategory {
  id: QuickReplyTemplate['category'] | 'all';
  label: string;
  labelEn: string;
  iconName: string;
  color: string;
}

export const QUICK_REPLY_CATEGORIES: QuickReplyCategory[] = [
  { id: 'all', label: 'සියල්ල (All Templates)', labelEn: 'All Templates', iconName: 'Layers', color: 'emerald' },
  { id: 'greeting', label: 'පිළිගැනීම (Greetings)', labelEn: 'Greetings & Intro', iconName: 'Smile', color: 'blue' },
  { id: 'govimithuru', label: 'ගොවිමිතුරු (Govimithuru)', labelEn: 'Govimithuru Advisory', iconName: 'Sprout', color: 'emerald' },
  { id: 'sayuru', label: 'සයුරු (Sayuru Service)', labelEn: 'Sayuru Marine Alerts', iconName: 'Compass', color: 'cyan' },
  { id: 'activation', label: 'ලියාපදිංචිය (Activation)', labelEn: 'Subscription & Codes', iconName: 'CheckCircle2', color: 'purple' },
  { id: 'support', label: 'පාරිභෝගික සහාය (Support)', labelEn: 'Customer Support', iconName: 'HelpCircle', color: 'amber' },
  { id: 'callback', label: 'නැවත ඇමතුම් (Call-Back)', labelEn: 'Follow-up & Hold', iconName: 'PhoneCall', color: 'rose' },
  { id: 'closing', label: 'සමුගැනීම (Closing)', labelEn: 'Call Wrap-up', iconName: 'HeartHandshake', color: 'teal' },
];

export const PREDEFINED_QUICK_REPLIES: QuickReplyTemplate[] = [
  // --- 1. GREETINGS & INTRO ---
  {
    id: 'qr-greet-1',
    title: 'සුබ උදෑසනක් / දවසක් (Formal Greeting)',
    category: 'greeting',
    text: 'ආයුබෝවන්! DD WORLD ආයතනයේ පාරිභෝගික උපදේශන අංශයෙන් අමතන්නේ. අද දින ඔබට මා සහාය විය හැක්කේ කෙසේද?',
    shortCode: '/greet',
    language: 'sinhala',
    tags: ['welcome', 'intro', 'greeting', 'agent'],
  },
  {
    id: 'qr-greet-2',
    title: 'English Professional Greeting',
    category: 'greeting',
    text: 'Hello! Thank you for connecting with DD WORLD Customer Support. My name is your dedicated advisor. How may I assist you today?',
    shortCode: '/greeten',
    language: 'english',
    tags: ['english', 'welcome', 'support'],
  },
  {
    id: 'qr-greet-3',
    title: 'Dialog නිල නියෝජිත හඳුන්වාදීම (Dialog Govimithuru intro)',
    category: 'greeting',
    text: 'ආයුබෝවන්, මා DD WORLD හා ඩයලොග් නිල කෘෂිකාර්මික උපදේශන සේවාව නියෝජනය කරන නිලධාරියෙක්. ඔබගේ වගා ගැටලු සහ සේවාවන් පිළිබඳ විමසීමට ඔබව සාදරයෙන් පිළිගනිමු.',
    shortCode: '/dialogintro',
    language: 'sinhala',
    tags: ['dialog', 'intro', 'advisor'],
  },

  // --- 2. GOVIMITHURU ADVISORY (616) ---
  {
    id: 'qr-govi-1',
    title: 'ගොවිමිතුරු ලියාපදිංචි වීමේ කේතය (Govimithuru 616 Dial Code)',
    category: 'govimithuru',
    text: 'ගොවිමිතුරු සේවාව ඔබගේ Dialog දුරකථනයෙන් සක්‍රීය කර ගැනීමට #616# ඩයල් කරන්න හෝ 616 අමතා ඔබගේ වගාව තෝරා දිනපතා කෘෂි උපදෙස් ලබාගත හැක. දිනකට රු. 1.00 + බදු පමණි.',
    shortCode: '/govi616',
    language: 'sinhala',
    tags: ['govimithuru', '616', 'ussd', 'crops', 'farming'],
  },
  {
    id: 'qr-govi-2',
    title: 'කෘමිනාශක හා පොහොර උපදෙස් (Crop Pest Advisory)',
    category: 'govimithuru',
    text: 'ඔබගේ වගාවේ කොළ කහවීම හෝ කෘමි හානිය පිළිබඳ විස්තර අපගේ කෘෂි විශේෂඥ පද්ධතිය වෙත යොමු කර ඇත. නියමිත පොහොර මාත්‍රාව සහ ආරක්‍ෂිත පියවර අඩංගු කෙටි පණිවිඩයක් ඔබගේ දුරකථනයට සුළු මොහොතකින් ලැබෙනු ඇත.',
    shortCode: '/govipest',
    language: 'sinhala',
    tags: ['pest', 'fertilizer', 'crops', 'agriculture'],
  },
  {
    id: 'qr-govi-3',
    title: 'කාලගුණ හා වර්ෂා අනාවැකි (Govimithuru Rain Alerts)',
    category: 'govimithuru',
    text: 'ගොවිමිතුරු කාලගුණ පද්ධතියට අනුව ඔබගේ ප්‍රදේශයේ ඉදිරි පැය 24 තුළ වැසි ඇතිවීමේ හැකියාව පිළිබඳ විශේෂ දැනුම්දීමක් 616 සේවාව හරහා ශ්‍රව්‍ය පණිවිඩයක් ලෙස ඔබ වෙත නිකුත් කෙරේ.',
    shortCode: '/goviweather',
    language: 'sinhala',
    tags: ['weather', 'rain', 'forecast', 'farmers'],
  },
  {
    id: 'qr-govi-4',
    title: 'Govimithuru App Download Link',
    category: 'govimithuru',
    text: 'ඔබට ස්මාර්ට් දුරකථනයක් (Android Smartphone) ඇත්නම්, Google Play Store වෙතින් "Govimithuru" App එක නොමිලේ Download කරගෙන ඡායාරූප මඟින් රෝග හඳුනාගත හැක.',
    shortCode: '/goviapp',
    language: 'sinhala',
    tags: ['app', 'android', 'playstore', 'download'],
  },

  // --- 3. SAYURU MARINE & WEATHER (770 / USSD) ---
  {
    id: 'qr-sayuru-1',
    title: 'සයුරු සේවාව සක්‍රීය කිරීම (Sayuru Activation)',
    category: 'sayuru',
    text: 'ධීවර සහෝදරයින් සඳහා වන Dialog සයුරු සේවාව සක්‍රීය කිරීමට ඔබගේ Dialog දුරකථනයෙන් #770# ඩයල් කරන්න. මුහුදු කාලගුණය, සුළඟේ වේගය සහ උදම් රළ අනතුරු ඇඟවීම් ක්ෂණිකව ශ්‍රවණය කළ හැක.',
    shortCode: '/sayuru770',
    language: 'sinhala',
    tags: ['sayuru', '770', 'marine', 'fisheries', 'sea'],
  },
  {
    id: 'qr-sayuru-2',
    title: 'හදිසි මුහුදු කාලගුණ අනතුරු ඇඟවීම (Marine Storm Alert)',
    category: 'sayuru',
    text: 'කාලගුණ විද්‍යා දෙපාර්තමේන්තුවේ සහ නාරා (NARA) ආයතනයේ නවතම නිවේදන අනුව ඉදිරි පැය කිහිපය තුළ ගැඹුරු මුහුදු ප්‍රදේශවල සුළඟේ වේගය ඉහළ යා හැක. කරුණාකර මුහුදු යාමට පෙර 770 අමතා තහවුරු කරගන්න.',
    shortCode: '/sayurualert',
    language: 'sinhala',
    tags: ['storm', 'danger', 'alert', 'marine'],
  },
  {
    id: 'qr-sayuru-3',
    title: 'Sayuru GPS Distance & Zone Guidelines',
    category: 'sayuru',
    text: 'සයුරු සේවාවේ GPS සිතියම් සේවාව මඟින් ඔබ සිටින මුහුදු සීමාව හා ගොඩබිමට ඇති දුර නිවැරදිව ගණනය කරගත හැක. වැඩිදුර විස්තර සඳහා 770 වෙතින් 1 ඔබන්න.',
    shortCode: '/sayurugps',
    language: 'sinhala',
    tags: ['sayuru', 'gps', 'zone', 'coordinates'],
  },

  // --- 4. ACTIVATION & SUBSCRIPTION ---
  {
    id: 'qr-act-1',
    title: 'ලියාපදිංචිය තහවුරු කිරීම (Subscription Confirmed)',
    category: 'activation',
    text: 'ඔබගේ සේවාව සාර්ථකව සක්‍රීය කරන ලදී (Successfully Activated). මේ පිළිබඳව තහවුරු කිරීමේ SMS පණිවිඩයක් ඔබගේ දුරකථන අංකය වෙත ලැබෙනු ඇත. සේවාව තෝරාගැනීම ගැන ස්තූතියි!',
    shortCode: '/activated',
    language: 'sinhala',
    tags: ['success', 'active', 'confirmed', 'sms'],
  },
  {
    id: 'qr-act-2',
    title: 'සේවාව අවලංගු කිරීමේ පියවර (Deactivation / Unsubscribe)',
    category: 'activation',
    text: 'සේවාව අක්‍රීය (Deactivate) කිරීමට අවශ්‍ය නම් #616# හෝ #770# අමතා "Unsubscribe" විකල්පය තෝරන්න. කිසිදු අමතර ගාස්තුවක් අය නොවේ.',
    shortCode: '/deact',
    language: 'sinhala',
    tags: ['unsubscribe', 'cancel', 'stop'],
  },
  {
    id: 'qr-act-3',
    title: 'ගාස්තු අයවීම් විස්තරය (Billing Breakdown)',
    category: 'activation',
    text: 'මෙම සේවාව සඳහා දිනකට අයවන්නේ රු. 1.00 + රජයේ බදු මුදල පමණි. ඔබ Postpaid පාරිභෝගිකයෙක් නම් මාසික බිල්පතටත්, Prepaid නම් දෛනික Reload ශේෂයෙන්ද අයවේ.',
    shortCode: '/billing',
    language: 'sinhala',
    tags: ['price', 'reload', 'billing', 'cost'],
  },

  // --- 5. CUSTOMER SUPPORT & TROUBLESHOOTING ---
  {
    id: 'qr-sup-1',
    title: 'දුරකථන අංකය සහ විස්තර සත්‍යාපනය (NIC / Number Verification)',
    category: 'support',
    text: 'ඔබගේ අනන්‍යතාවය හා සේවාව නිවැරදිව තහවුරු කරගැනීම සඳහා ඔබගේ ජාතික හැඳුනුම්පත් (NIC) අංකය සහ ලියාපදිංචි Dialog අංකය පවසන්න.',
    shortCode: '/verify',
    language: 'sinhala',
    tags: ['nic', 'verification', 'security', 'account'],
  },
  {
    id: 'qr-sup-2',
    title: 'තාක්ෂණික දෝෂය පරීක්ෂා කරමින් පවතී (Investigating Issue)',
    category: 'support',
    text: 'ඔබ සඳහන් කළ තාක්ෂණික ගැටලුව අපගේ තාක්ෂණික අංශය (Technical Department) වෙත යොමු කරන ලදී. පැය 2ක් ඇතුළත ගැටලුව නිරාකරණය කර ඔබට දන්වනු ලැබේ.',
    shortCode: '/investigate',
    language: 'sinhala',
    tags: ['tech', 'error', 'fix', 'ticket'],
  },
  {
    id: 'qr-sup-3',
    title: 'SMS පණිවිඩ නොලැබීමේ ගැටලුව (SMS Delivery Issue)',
    category: 'support',
    text: 'ඔබට උපදේශන SMS නොලැබෙන්නේ නම්, කරුණාකර දුරකථනයේ Inbox Memory පරීක්ෂා කර දුරකථනය Restart කර නැවත පරික්ෂා කරන්න.',
    shortCode: '/nosms',
    language: 'sinhala',
    tags: ['sms', 'troubleshoot', 'restart'],
  },

  // --- 6. CALL-BACK & HOLD FOLLOW-UP ---
  {
    id: 'qr-call-1',
    title: 'ඇමතුම මොහොතකට Hold කිරීම (Please Hold the Line)',
    category: 'callback',
    text: 'ඔබගේ තොරතුරු නිවැරදිව පරීක්ෂා කර ගැනීම සඳහා කරුණාකර තත්පර කිහිපයක් රැඳී සිටින්න (Please hold on the line). මා විනාඩියක් ඇතුළත පිළිතුර ලබා දෙන්නෙමි.',
    shortCode: '/hold',
    language: 'sinhala',
    tags: ['hold', 'wait', 'checking'],
  },
  {
    id: 'qr-call-2',
    title: 'විනාඩි 10 කින් නැවත ඇමතීම (Will Call Back in 10 mins)',
    category: 'callback',
    text: 'අපගේ ජ්‍යෙෂ්ඨ කෘෂි/සේවා නිලධාරීවරයා සමඟ සාකච්ඡා කර තවත් විනාඩි 10-15 කින් ඔබගේ අංකයට නැවත දුරකථන ඇමතුමක් ලබා දෙන්නෙමි. කරුණාකර රැඳී සිටින්න.',
    shortCode: '/callback',
    language: 'sinhala',
    tags: ['callback', 'later', 'followup'],
  },
  {
    id: 'qr-call-3',
    title: 'ඇමතුම විසන්ධි වුවහොත් (If Call Disconnects)',
    category: 'callback',
    text: 'සංඥා දෝෂයක් නිසා ඇමතුම විසන්ධි වුවහොත් අප ආයතනය විසින්ම ඔබගේ අංකය වෙත නැවත ඇමතුමක් ලබාගන්නා බැවින් කරුණාකර රැඳී සිටින්න.',
    shortCode: '/disconnect',
    language: 'sinhala',
    tags: ['signal', 'disconnect', 'retry'],
  },

  // --- 7. CLOSING & FAREWELL ---
  {
    id: 'qr-close-1',
    title: 'සුහද සමුගැනීම (Friendly Closing & Courtesy)',
    category: 'closing',
    text: 'DD WORLD සේවාව හා සම්බන්ධ වීම පිළිබඳව ඔබට බෙහෙවින්ම ස්තූතියි! ඔබට තවත් යම් ගැටලුවක් ඇත්නම් ඕනෑම වේලාවක අප අමතන්න. සුබ දවසක් වේවා!',
    shortCode: '/thanks',
    language: 'sinhala',
    tags: ['thankyou', 'bye', 'closing', 'friendly'],
  },
  {
    id: 'qr-close-2',
    title: 'English Professional Sign-off',
    category: 'closing',
    text: 'Thank you for contacting DD WORLD Enterprise Support. It was a pleasure assisting you today. Wishing you a wonderful and prosperous day ahead!',
    shortCode: '/thanksen',
    language: 'english',
    tags: ['english', 'closing', 'farewell'],
  },
  {
    id: 'qr-close-3',
    title: 'Rating & Feedback Request',
    category: 'closing',
    text: 'අපගේ සේවාවේ ගුණාත්මකභාවය ඉහළ නැංවීම සඳහා මෙම ඇමතුම අවසානයේ ලැබෙන කෙටි SMS ඇගයීමට සහභාගී වන මෙන් කාරුණිකව ඉල්ලා සිටිමු. ස්තූතියි!',
    shortCode: '/feedback',
    language: 'sinhala',
    tags: ['rating', 'feedback', 'quality'],
  },
];

export interface Activity {
  id: string;
  images: string[];
  date: string;
  year: number; // พ.ศ.
  title: string;
  context: string;
  what: string;
  where: string;
  how: string;
  sourceUrls?: string[];
}

export const activities: Activity[] = [
  {
    "id": "act-2569-01",
    "year": 2569,
    "date": "18 กุมภาพันธ์ 2569",
    "title": "งานประชุมวิชาการระดับนานาชาติ IEEE Smart Campus & AI Biometrics Symposium 2026",
    "context": "รศ.ดร.กิตติศักดิ์ พัฒนไพบูลย์ ผู้อำนวยการศูนย์นวัตกรรมปัญญาประดิษฐ์ มหาวิทยาลัยสวนดุสิต บรรยายพิเศษหัวข้อ 'Next-Gen Facial Intelligence and Real-time Vector Matching' พร้อมเปิดตัวผลงานระบบสแกนใบหน้าตรวจสอบความปลอดภัย Smart Campus โดยทีมนักศึกษาฝ่ายวิจัย นำโดยนายปวีณวัชร์ เหลืองอุทัย",
    "what": "ปาฐกถาพิเศษและนำเสนอผลงานวิจัยการประยุกต์ใช้ InsightFace ArcFace สำหรับงานเฝ้าระวังและบันทึกประวัติการเข้าออกพื้นที่ปลอดภัย",
    "where": "หอประชุมรักตะกนิษฐ์ มหาวิทยาลัยสวนดุสิต",
    "how": "การบรรยายวิชาการระดับนานาชาติและการจัดแสดงนิทรรศการระบบต้นแบบ AI Intelligence",
    "images": [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80"
    ],
    "sourceUrls": [
      "https://www.dusit.ac.th/home/ai-symposium-2569"
    ]
  },
  {
    "id": "act-2569-02",
    "year": 2569,
    "date": "12 มกราคม 2569",
    "title": "พิธีลงนามความร่วมมือ (MOU) วิจัยและพัฒนาระบบ AI Vision ร่วมกับ NECTEC",
    "context": "รศ.ดร.กิตติศักดิ์ พัฒนไพบูลย์ เป็นตัวแทนมหาวิทยาลัยสวนดุสิต ร่วมลงนามบันทึกข้อตกลงความร่วมมือทางวิชาการด้านปัญญาประดิษฐ์และระบบรู้จำชีวมิติ เพื่อขับเคลื่อน Smart Security Gateway",
    "what": "การลงนามข้อตกลงความร่วมมือการวิจัยและพัฒนาโมเดลปัญญาประดิษฐ์เพื่อความปลอดภัย",
    "where": "ห้องประชุมพวงเงิน อาคารสำนักงานมหาวิทยาลัย มหาวิทยาลัยสวนดุสิต",
    "how": "พิธีลงนามบันทึกความเข้าใจ (MOU) และการเสวนาทิศทางการวิจัยเทคโนโลยีคอมพิวเตอร์วิทัศน์",
    "images": [
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80"
    ],
    "sourceUrls": [
      "https://www.dusit.ac.th/home/mou-nectec-2569"
    ]
  },
  {
    "id": "act-2568-01",
    "year": 2568,
    "date": "24 พฤศจิกายน 2568",
    "title": "การซักซ้อมรับมือภัยคุกคามไซเบอร์และตรวจสอบความปลอดภัยระบบ Biometric Campus Audit 2025",
    "context": "การทดสอบความมั่นคงปลอดภัยสารสนเทศของระบบยืนยันตัวตนด้วยใบหน้าและป้องกันการปลอมแปลง (Anti-Spoofing Drill) นำโดย รศ.ดร.กิตติศักดิ์ พัฒนไพบูลย์ และทีมนักศึกษาฝ่ายวิจัย",
    "what": "การตรวจสอบช่องโหว่และประเมินความแม่นยำของระบบ Biometric Intelligence ภายใต้มาตรฐาน ISO/IEC 27001",
    "where": "ห้องปฏิบัติการคอมพิวเตอร์และเครือข่าย ชั้น 4 คณะวิทยาศาสตร์และเทคโนโลยี สวนดุสิต",
    "how": "การทดสอบเชิงรุก Penetration Testing และ Red Team Simulation สำหรับระบบ Face Recognition",
    "images": [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80"
    ],
    "sourceUrls": [
      "https://www.dusit.ac.th/home/cyber-audit-2568"
    ]
  },
  {
    "id": "act-2568-02",
    "year": 2568,
    "date": "15 สิงหาคม 2568",
    "title": "การประชุมวิชาการ National Conference on Applied Computer Science & Artificial Intelligence",
    "context": "รศ.ดร.กิตติศักดิ์ พัฒนไพบูลย์ เป็นประธานเปิดการประชุมวิชาการและเป็นผู้ทรงคุณวุฒิประเมินบทความวิจัยด้าน Deep Learning และ Edge Computing",
    "what": "เวทีนำเสนอผลงานวิจัยระดับชาติของอาจารย์และนักศึกษาระดับปริญญาตรีและบัณฑิตศึกษา",
    "where": "ศูนย์การศึกษานอกที่ตั้งสุพรรณบุรี มหาวิทยาลัยสวนดุสิต",
    "how": "การนำเสนอทางวิชาการ (Oral & Poster Presentation) และการประกวดโครงงานนวัตกรรม",
    "images": [
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80"
    ],
    "sourceUrls": [
      "https://www.dusit.ac.th/home/nc-applied-cs-2568"
    ]
  },
  {
    "id": "act-2568-03",
    "year": 2568,
    "date": "19 เมษายน 2568",
    "title": "โครงการอบรมเชิงปฏิบัติการ Advanced Computer Vision with Deep Learning & YOLO",
    "context": "ถ่ายทอดทักษะการสร้างโมเดลตรวจจับใบหน้าและวิเคราะห์พฤติกรรมบุคคลด้วย Python, PyTorch และ ONNX Runtime ให้กับนักศึกษาและนักพัฒนาภายนอก",
    "what": "การอบรมเข้มข้น Hands-on Workshop การเทรนโมเดล Object Detection และ Face Verification",
    "where": "ห้องปฏิบัติการ AI Research Lab สวนดุสิต",
    "how": "บรรยายทฤษฎีควบคู่การลงมือปฏิบัติการเขียนโค้ดจริงบน GPU Server",
    "images": [
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?auto=format&fit=crop&w=1200&q=80"
    ],
    "sourceUrls": [
      "https://www.dusit.ac.th/home/cv-workshop-2568"
    ]
  },
  {
    "id": "act-2567-01",
    "year": 2567,
    "date": "10 พฤศจิกายน 2567",
    "title": "เสวนาวิชาการ 'AI Ethics & Data Protection in Biometric Systems' ตาม พ.ร.บ. PDPA",
    "context": "รศ.ดร.กิตติศักดิ์ พัฒนไพบูลย์ ร่วมเป็นวิทยากรเสวนากับผู้เชี่ยวชาญด้านกฎหมายไซเบอร์ ในประเด็นจริยธรรมปัญญาประดิษฐ์และการจัดเก็บอัตลักษณ์ชีวมิติใบหน้า",
    "what": "การสร้างความตระหนักรู้เกี่ยวกับข้อกำหนดทางกฎหมาย PDPA ในการใช้งานกล้อง AI และระบบคัดกรองบุคคล",
    "where": "ห้องประชุม 301 ศูนย์วิทยาศาสตร์ ถนนสิรินธร มหาวิทยาลัยสวนดุสิต",
    "how": "การเสวนาโต๊ะกลม (Panel Discussion) และการตอบข้อซักถามจากผู้บริหารและนักวิจัย",
    "images": [
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80"
    ],
    "sourceUrls": [
      "https://www.dusit.ac.th/home/ai-ethics-pdpa-2567"
    ]
  },
  {
    "id": "act-2567-02",
    "year": 2567,
    "date": "22 กรกฎาคม 2567",
    "title": "การประกวดนวัตกรรม Suan Dusit AI Hackathon 2024",
    "context": "ศูนย์นวัตกรรมปัญญาประดิษฐ์ จัดการแข่งขันค้นหาสุดยอดไอเดียการใช้ AI ยกระดับคุณภาพชีวิตในมหาวิทยาลัย โดยมี รศ.ดร.กิตติศักดิ์ พัฒนไพบูลย์ เป็นประธานคณะกรรมการตัดสิน",
    "what": "การแข่งขันสร้างเว็บแอปพลิเคชันและโมเดลปัญญาประดิษฐ์ประยุกต์ตลอด 36 ชั่วโมง",
    "where": "Co-Working Space อาคาร 2 มหาวิทยาลัยสวนดุสิต",
    "how": "กิจกรรม Hackathon การโค้ชชิ่งโดยผู้เชี่ยวชาญ และการ Pitching ต่อหน้านักลงทุน",
    "images": [
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
    ],
    "sourceUrls": [
      "https://www.dusit.ac.th/home/ai-hackathon-2567"
    ]
  },
  {
    "id": "act-2567-03",
    "year": 2567,
    "date": "14 มีนาคม 2567",
    "title": "การประชุมสภาคณาจารย์และพนักงาน เรื่อง นโยบายพัฒนาดิจิทัลทรานส์ฟอร์เมชัน",
    "context": "รศ.ดร.กิตติศักดิ์ พัฒนไพบูลย์ นำเสนอแผนแม่บทการบูรณาการระบบฐานข้อมูลกลางและโครงสร้างพื้นฐาน AI สำหรับรองรับ Smart University 2025-2030",
    "what": "การขับเคลื่อนยุทธศาสตร์มหาวิทยาลัยดิจิทัลและการเชื่อมโยงข้อมูลระหว่างคณะ",
    "where": "ห้องประชุมลำพอง 2 มหาวิทยาลัยสวนดุสิต",
    "how": "การประชุมรายงานผลสัมฤทธิ์ของโครงการและรับฟังความคิดเห็นจากตัวแทนบุคลากร",
    "images": [
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80"
    ],
    "sourceUrls": [
      "https://www.dusit.ac.th/home/faculty-council-2567"
    ]
  },
  {
    "id": "act-2566-01",
    "year": 2566,
    "date": "18 ธันวาคม 2566",
    "title": "งานสัปดาห์วิทยาศาสตร์และนวัตกรรมเทคโนโลยี มหาวิทยาลัยสวนดุสิต 2566",
    "context": "การจัดแสดงผลงานนวัตกรรม 'Detective Face AI & Biometric Recognition' ที่พัฒนาขึ้นเพื่อการสืบค้นประวัติกิจกรรมและยืนยันตัวตนบุคคลผ่านโครงข่ายประสาทเทียม",
    "what": "นิทรรศการแสดงผลงานทางวิทยาการคอมพิวเตอร์และระบบปัญญาประดิษฐ์เพื่อสาธารณประโยชน์",
    "where": "โถงกิจกรรม อาคารรักตะกนิษฐ์ มหาวิทยาลัยสวนดุสิต",
    "how": "การสาธิตระบบถ่ายทอดสด Live Demo หน้างาน และการให้ความรู้แก่นักเรียนนักศึกษา",
    "images": [
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80"
    ],
    "sourceUrls": [
      "https://www.dusit.ac.th/home/science-week-2566"
    ]
  },
  {
    "id": "act-2566-02",
    "year": 2566,
    "date": "29 กันยายน 2566",
    "title": "การทดสอบระบบ Big Data Indexer สำหรับคลังภาพกิจกรรมมหาวิทยาลัย",
    "context": "ทีมวิจัยร่วมพัฒนาสถาปัตยกรรมคลังภาพและระบบสกัดเวกเตอร์ใบหน้า 512 มิติ สามารถดัชนีและค้นหาภาพกิจกรรมย้อนหลังกว่า 10 ปีได้อย่างมีประสิทธิภาพ",
    "what": "การติดตั้งและทดสอบระบบประมวลผลเวกเตอร์ใบหน้าบนเซิร์ฟเวอร์ความเร็วสูง",
    "where": "ศูนย์ข้อมูลสารสนเทศ สำนักวิทยบริการและเทคโนโลยีสารสนเทศ สวนดุสิต",
    "how": "การทดสอบ Performance Benchmark และการปรับแต่งพารามิเตอร์ Cosine Similarity",
    "images": [
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80"
    ],
    "sourceUrls": [
      "https://www.dusit.ac.th/home/bigdata-indexer-2566"
    ]
  },
  {
    "id": "act-2566-03",
    "year": 2566,
    "date": "15 พฤษภาคม 2566",
    "title": "โครงการพัฒนาศักยภาพอาจารย์และนักวิจัยสู่การเป็นผู้เชี่ยวชาญ AI & Data Science",
    "context": "รศ.ดร.กิตติศักดิ์ พัฒนไพบูลย์ จัดอบรมหลักสูตรเตรียมความพร้อมบุคลากรสายวิชาการ ในการใช้ประโยชน์จาก Generative AI และ Machine Learning สำหรับการวิจัยยุคใหม่",
    "what": "การสัมมนาเชิงปฏิบัติการเพื่อยกระดับทักษะทางเทคโนโลยีดิจิทัลของคณาจารย์",
    "where": "ห้องปฏิบัติการคอมพิวเตอร์ อาคาร 11 มหาวิทยาลัยสวนดุสิต",
    "how": "การบรรยาย แลกเปลี่ยนแนวทาง และการจัดทำโครงร่างงานวิจัยร่วมกันระหว่างสาขาวิชา",
    "images": [
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80"
    ],
    "sourceUrls": [
      "https://www.dusit.ac.th/home/faculty-ai-training-2566"
    ]
  },
  {
    "id": "act-2565-01",
    "year": 2565,
    "date": "21 พฤศจิกายน 2565",
    "title": "การประชุมความร่วมมือทางวิชาการและวิจัยระหว่างสถาบันอุดมศึกษาเครือข่ายวิจัยดิจิทัล",
    "context": "ร่วมกำหนดทิศทางการวิจัยด้านปัญญาประดิษฐ์เพื่อการศึกษาและการพัฒนาหลักสูตรสองปริญญา (Double Degree) สาขาวิทยาการข้อมูล",
    "what": "การประชุมเครือข่ายความร่วมมือทางวิชาการสถาบันอุดมศึกษา 8 สถาบัน",
    "where": "ห้องประชุมศาลาช้าง มหาวิทยาลัยสวนดุสิต",
    "how": "การประชุมคณะกรรมการเครือข่ายและการสรุปข้อตกลงความร่วมมือทางวิชาการ",
    "images": [
      "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80"
    ],
    "sourceUrls": [
      "https://www.dusit.ac.th/home/university-consortium-2565"
    ]
  },
  {
    "id": "act-2565-02",
    "year": 2565,
    "date": "08 สิงหาคม 2565",
    "title": "การนำเสนอผลงานต้นแบบ 'Smart Attendance System' ด้วยใบหน้าในห้องบรรยายรวม",
    "context": "สาธิตระบบเช็คชื่อนักศึกษาอัตโนมัติด้วยกล้อง Wide-angle และ AI Face Multi-Detection ครอบคลุมห้องบรรยายขนาด 200 ที่นั่งอย่างแม่นยำ",
    "what": "การทดสอบและประเมินผลการใช้งานระบบตรวจจับใบหน้าในสถานการณ์ห้องเรียนจริง",
    "where": "ห้องบรรยายรวม 11201 อาคาร 11 มหาวิทยาลัยสวนดุสิต",
    "how": "การทดลองภาคสนามและการเก็บสถิติความพึงพอใจของผู้ใช้งาน",
    "images": [
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
    ],
    "sourceUrls": [
      "https://www.dusit.ac.th/home/smart-attendance-2565"
    ]
  },
  {
    "id": "act-2564-01",
    "year": 2564,
    "date": "14 ตุลาคม 2564",
    "title": "การสัมมนาออนไลน์ 'Next-Generation DevSecOps & Cloud Security Architecture'",
    "context": "บรรยายออนไลน์ให้แก่สมาคมคอมพิวเตอร์แห่งประเทศไทย หัวข้อการรวมกระบวนการรักษาความปลอดภัยเข้ากับวงจรการพัฒนาซอฟต์แวร์ CI/CD",
    "what": "การแบ่งปันแนวปฏิบัติที่ดีที่สุดในการพัฒนาเว็บแอปพลิเคชันที่มีความมั่นคงปลอดภัย",
    "where": "ศูนย์ปฏิบัติการสื่อดิจิทัล สวนดุสิต (Virtual Webinar)",
    "how": "การบรรยายออนไลน์และการถ่ายทอดสดผ่านระบบเครือข่ายอินเทอร์เน็ต",
    "images": [
      "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"
    ],
    "sourceUrls": [
      "https://www.dusit.ac.th/home/devsecops-webinar-2564"
    ]
  },
  {
    "id": "act-2563-01",
    "year": 2563,
    "date": "25 ธันวาคม 2563",
    "title": "การรับมอบรางวัลนักวิจัยดีเด่น สาขาวิทยาศาสตร์และเทคโนโลยี ประจำปี 2563",
    "context": "รศ.ดร.กิตติศักดิ์ พัฒนไพบูลย์ ได้รับคัดเลือกให้รับรางวัลนักวิจัยดีเด่น จากผลงานการวิจัยและพัฒนาปัญญาประดิษฐ์ระบบสแกนใบหน้าเพื่อความมั่นคงปลอดภัย",
    "what": "พิธีมอบรางวัลเชิดชูเกียรตินักวิจัยและบุคลากรทรงคุณค่าแห่งมหาวิทยาลัยสวนดุสิต",
    "where": "หอประชุมใหญ่ สวนดุสิต",
    "how": "พิธีมอบโล่เกียรติยศและเกียรติบัตรประกาศเกียรติคุณ",
    "images": [
      "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80"
    ],
    "sourceUrls": [
      "https://www.dusit.ac.th/home/researcher-award-2563"
    ]
  },
  {
    "id": "act-2562-01",
    "year": 2562,
    "date": "19 สิงหาคม 2562",
    "title": "การประชุมวิชาการระดับนานาชาติ IEEE International Conference on Computer Science 2019",
    "context": "นำเสนอบทความวิจัย 'Feature Vector Extraction via Deep Convolutional Networks for Biometric Surveillance' ณ ประเทศสิงคโปร์",
    "what": "การนำเสนอผลงานทางวิชาการและสร้างเครือข่ายความร่วมมือนานาชาติ",
    "where": "Suntec Singapore Convention & Exhibition Centre",
    "how": "การนำเสนอผลงานภาคบรรยายภาษาอังกฤษและการแลกเปลี่ยนแนวคิดกับนักวิจัยชั้นนำ",
    "images": [
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80"
    ],
    "sourceUrls": [
      "https://www.dusit.ac.th/home/ieee-iccs-2562"
    ]
  },
  {
    "id": "act-2561-01",
    "year": 2561,
    "date": "14 พฤศจิกายน 2561",
    "title": "โครงการพัฒนาระบบรักษาความปลอดภัยดิจิทัลสำหรับเครือข่ายอุดมศึกษาภาคกลาง",
    "context": "เป็นหัวหน้าโครงการวิจัยพัฒนาระบบตรวจจับและแจ้งเตือนการบุกรุกเครือข่ายคอมพิวเตอร์และระบบตรวจจับบุคคลต้องสงสัย",
    "what": "การดำเนินงานโครงการวิจัยร่วมระหว่าง 5 มหาวิทยาลัย",
    "where": "มหาวิทยาลัยสวนดุสิต",
    "how": "การประชุมติดตามความก้าวหน้ารายไตรมาสและการส่งมอบรายงานวิจัยฉบับสมบูรณ์",
    "images": [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80"
    ],
    "sourceUrls": [
      "https://www.dusit.ac.th/home/security-research-2561"
    ]
  },
  {
    "id": "act-2560-01",
    "year": 2560,
    "date": "28 เมษายน 2560",
    "title": "การจัดตั้งศูนย์ความเป็นเลิศด้านปัญญาประดิษฐ์และวิทยาการข้อมูล (AI Innovation Center)",
    "context": "ริเริ่มและเป็นผู้ร่วมก่อตั้งศูนย์วิจัยเทคโนโลยีดิจิทัล มหาวิทยาลัยสวนดุสิต เพื่อเป็นศูนย์กลางการเรียนรู้และพัฒนานวัตกรรมปัญญาประดิษฐ์",
    "what": "พิธีเปิดศูนย์นวัตกรรมและการจัดแสดงเทคโนโลยีต้นแบบ",
    "where": "อาคารเฉลิมพระเกียรติ มหาวิทยาลัยสวนดุสิต",
    "how": "พิธีเปิดอย่างเป็นทางการและการนำชมนิทรรศการนวัตกรรมคอมพิวเตอร์",
    "images": [
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80"
    ],
    "sourceUrls": [
      "https://www.dusit.ac.th/home/ai-center-founding-2560"
    ]
  }
];

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scan,
  Zap,
  Cpu,
  Eye,
  Activity,
  Layers,
  Camera,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  HardDrive,
  BarChart3,
  Sliders,
  ShieldAlert,
  Server,
  Play,
  QrCode,
  Check,
  Copy,
  ExternalLink,
  Code2,
  Terminal,
  FileCode,
  Gauge
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { toast } from '../hooks/useToast';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Simulated dynamic bounding boxes in hero
  const [activeFrame, setActiveFrame] = useState(0);

  // Features interactive state
  const [featureCategory, setFeatureCategory] = useState<'all' | 'detection' | 'qr' | 'telemetry'>('all');
  const [interactiveConfidence, setInteractiveConfidence] = useState<number>(0.50);
  const [selectedDemoClass, setSelectedDemoClass] = useState<string>('all');

  // Technology interactive pipeline state
  const [activeStageIndex, setActiveStageIndex] = useState<number>(2); // default: YOLO model stage
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFrame((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const simulatedDetections = [
    [
      { label: 'Person', conf: '98.4%', rawConf: 0.98, x: '18%', y: '22%', w: '26%', h: '62%', color: '#2F80FF' },
      { label: 'Car', conf: '96.7%', rawConf: 0.96, x: '52%', y: '40%', w: '38%', h: '44%', color: '#3B8DFF' },
      { label: 'Traffic Light', conf: '91.8%', rawConf: 0.91, x: '74%', y: '12%', w: '14%', h: '25%', color: '#F59E0B' },
      { label: 'Phone', conf: '89.4%', rawConf: 0.89, x: '32%', y: '48%', w: '10%', h: '18%', color: '#18C8FF' },
    ],
    [
      { label: 'Person', conf: '99.1%', rawConf: 0.99, x: '22%', y: '20%', w: '24%', h: '65%', color: '#2F80FF' },
      { label: 'Car', conf: '97.4%', rawConf: 0.97, x: '56%', y: '42%', w: '35%', h: '42%', color: '#3B8DFF' },
      { label: 'Traffic Light', conf: '93.2%', rawConf: 0.93, x: '74%', y: '12%', w: '14%', h: '25%', color: '#F59E0B' },
      { label: 'Laptop', conf: '95.6%', rawConf: 0.95, x: '28%', y: '52%', w: '16%', h: '22%', color: '#18C8FF' },
    ],
    [
      { label: 'Person', conf: '97.8%', rawConf: 0.97, x: '16%', y: '24%', w: '28%', h: '60%', color: '#2F80FF' },
      { label: 'Car', conf: '98.2%', rawConf: 0.98, x: '50%', y: '38%', w: '40%', h: '46%', color: '#3B8DFF' },
      { label: 'Backpack', conf: '92.5%', rawConf: 0.92, x: '20%', y: '35%', w: '14%', h: '26%', color: '#8B5CF6' },
      { label: 'Traffic Light', conf: '94.0%', rawConf: 0.94, x: '74%', y: '12%', w: '14%', h: '25%', color: '#F59E0B' },
    ]
  ];

  const currentDetections = simulatedDetections[activeFrame].filter(
    (d) => selectedDemoClass === 'all' || d.label.toLowerCase().includes(selectedDemoClass.toLowerCase())
  );

  const metrics = [
    { value: '95%+', label: 'MODEL ACCURACY', desc: 'Precision on COCO 80 benchmark' },
    { value: '30 FPS', label: 'REAL-TIME PROCESSING', desc: 'Hardware-accelerated edge pipeline' },
    { value: '12ms', label: 'LOW LATENCY', desc: 'Instant neural frame processing' },
    { value: '80+', label: 'OBJECT CLASSES', desc: 'Everyday objects & scene recognition' },
  ];

  // Complete interactive feature cards
  const features = [
    {
      id: 'realtime',
      category: 'detection',
      icon: <Zap className="w-6 h-6 text-brand-blue" />,
      title: 'Real-Time Object Detection',
      desc: 'Analyze live camera frames with Ultralytics YOLO11n neural network at full 30 FPS.',
      actionText: 'Launch Live Studio →',
      action: () => navigate('/detector'),
    },
    {
      id: 'visionqr',
      category: 'qr',
      icon: <QrCode className="w-6 h-6 text-brand-cyan" />,
      title: 'Vision QR Code Studio',
      desc: 'Real-time OpenCV locator scanning and stylized high-resolution QR generator with error correction.',
      actionText: 'Open Vision QR →',
      action: () => navigate('/qr'),
    },
    {
      id: 'multiclass',
      category: 'detection',
      icon: <Layers className="w-6 h-6 text-brand-blue-bright" />,
      title: 'Multi-Object Recognition',
      desc: 'Simultaneously detect, segment, and categorize dozens of overlapping objects in dense frames.',
      actionText: 'Try Multi-Object Mode →',
      action: () => navigate('/detector'),
    },
    {
      id: 'confidence',
      category: 'detection',
      icon: <Sliders className="w-6 h-6 text-status-success" />,
      title: 'Confidence Scoring & IoU',
      desc: 'Dynamic threshold filtering eliminates false positives and refines bounding box overlaps.',
      actionText: 'Configure Thresholds →',
      action: () => navigate('/detector/model'),
    },
    {
      id: 'analytics',
      category: 'telemetry',
      icon: <BarChart3 className="w-6 h-6 text-status-warning" />,
      title: 'Live Telemetry & Analytics',
      desc: 'Continuous tracking of frame latency, GPU/CPU throughput, and class distribution trends.',
      actionText: 'View Dashboard →',
      action: () => navigate('/analytics'),
    },
    {
      id: 'capture',
      category: 'telemetry',
      icon: <HardDrive className="w-6 h-6 text-status-danger" />,
      title: 'Snapshot Capture & Export',
      desc: 'Save annotated snapshots, inspector layers, and download formatted CSV session records.',
      actionText: 'Browse History →',
      action: () => navigate('/history'),
    },
  ];

  const filteredFeatures = features.filter(
    (f) => featureCategory === 'all' || f.category === featureCategory
  );

  const steps = [
    {
      step: '01',
      title: 'Open Camera',
      desc: 'Connect your built-in or external webcam with zero drivers or installation required.',
    },
    {
      step: '02',
      title: 'Capture Frames',
      desc: 'High-speed browser video streaming delivers raw 720p/1080p frames to the vision pipeline.',
    },
    {
      step: '03',
      title: 'Run AI Model',
      desc: 'Ultralytics YOLO processes each frame with sub-15ms latency and precision NMS filtering.',
    },
    {
      step: '04',
      title: 'Visualize Results',
      desc: 'Dynamic bounding boxes, confidence pills, and telemetry render seamlessly in real-time.',
    },
  ];

  // Interactive Architecture Pipeline Data
  const architectureStages = [
    {
      stage: '01',
      title: 'Camera Input',
      subtitle: 'WebRTC 1080p / 720p',
      latency: '0.2ms',
      tensor: '1280 × 720 RGB',
      desc: 'Captures raw frames directly from browser media stream via HTML5 Video and Canvas.',
      icon: <Camera className="w-5 h-5 text-brand-cyan" />,
      code: `// WebRTC Video Stream Acquisition
const stream = await navigator.mediaDevices.getUserMedia({
  video: { width: { ideal: 1280 }, height: { ideal: 720 } }
});
videoElement.srcObject = stream;`,
    },
    {
      stage: '02',
      title: 'Preprocessing',
      subtitle: 'OpenCV & Base64 Decoder',
      latency: '1.4ms',
      tensor: '640 × 640 × 3 (BGR)',
      desc: 'Decodes JPEG bytes, normalizes pixel range to [0, 1], and performs letterbox padding.',
      icon: <Cpu className="w-5 h-5 text-brand-blue" />,
      code: `# Base64 Decoding & Letterboxing
nparr = np.frombuffer(base64.b64decode(b64_data), np.uint8)
image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
h, w = image.shape[:2]`,
    },
    {
      stage: '03',
      title: 'YOLO11n Neural Engine',
      subtitle: 'Next-Gen Edge Inference',
      latency: '11.8ms',
      tensor: '[1, 84, 8400] Tensors',
      desc: 'Ultralytics YOLO11n computes feature maps, bounding box proposals, and 80 COCO probabilities.',
      icon: <Zap className="w-5 h-5 text-brand-blue-bright" />,
      code: `# YOLO11n Forward Pass
results = model.predict(
    source=image,
    conf=0.25,
    iou=0.45,
    max_det=30,
    device='cpu' # or 'cuda'
)`,
    },
    {
      stage: '04',
      title: 'Detection & NMS',
      subtitle: 'Non-Maximum Suppression',
      latency: '0.8ms',
      tensor: 'Filtered Bounding Boxes',
      desc: 'Eliminates overlapping proposals using Intersection-over-Union (IoU) and outputs normalized coordinates.',
      icon: <Sliders className="w-5 h-5 text-status-success" />,
      code: `# Bounding Box Vectorization & Class Mapping
xyxy = boxes.xyxy.cpu().numpy()
conf = boxes.conf.cpu().numpy()
cls_id = boxes.cls.cpu().numpy()
cls_name = model.names[int(cls_id[i])]`,
    },
    {
      stage: '05',
      title: 'Telemetry Aggregator',
      subtitle: 'FastAPI & SQLite Store',
      latency: '0.4ms',
      tensor: 'JSON Response Payload',
      desc: 'Computes rolling FPS, average latency, and class distribution counts committed to database.',
      icon: <BarChart3 className="w-5 h-5 text-status-warning" />,
      code: `# Telemetry Payload Assembly
return {
    "success": True,
    "objects": detections,
    "object_count": len(detections),
    "average_confidence": round(avg_conf, 4),
    "processing_time_ms": latency_ms
}`,
    },
    {
      stage: '06',
      title: 'HUD Visualization',
      subtitle: 'High-DPI 60Hz Canvas',
      latency: '0.3ms',
      tensor: 'Layered Canvas 2D',
      desc: 'Draws anti-aliased glowing bounding boxes, corner brackets, and confidence pill tags over video.',
      icon: <Scan className="w-5 h-5 text-brand-cyan" />,
      code: `// High-DPI Canvas Rendering
ctx.strokeStyle = getObjectColor(box.class_name);
ctx.strokeRect(box.norm_x * width, box.norm_y * height, box.norm_width * width, box.norm_height * height);
ctx.fillText(box.class_name + ' ' + conf + '%', x + 8, y - 6);`,
    },
  ];

  const currentStage = architectureStages[activeStageIndex];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast('success', 'Code Snippet Copied');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleInstantSnapshot = () => {
    toast('success', 'Snapshot Captured', 'Annotated frame saved to Result Gallery.');
    setTimeout(() => navigate('/results'), 800);
  };

  return (
    <div className="min-h-screen bg-background text-content-primary flex flex-col selection:bg-brand-blue selection:text-white">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-blue/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-brand-cyan/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* LEFT COLUMN */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 space-y-6"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-cyan text-xs font-mono font-semibold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
                AI-POWERED COMPUTER VISION
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                See the World <br />
                <span className="text-white">Through AI.</span> <br />
                <span className="bg-gradient-to-r from-brand-blue-bright via-brand-cyan to-brand-blue bg-clip-text text-transparent">
                  Detect Objects Instantly.
                </span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-content-secondary leading-relaxed max-w-xl">
                Experience real-time object detection and Vision QR scanning powered by Ultralytics YOLO11n.
                Identify, segment, and understand objects directly through your camera with sub-15ms edge inference.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/detector"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-blue to-brand-blue-bright hover:opacity-95 transition-all shadow-glow-md hover:shadow-glow-cyan active:scale-95"
                >
                  <Scan className="w-4 h-4" />
                  <span>Launch Object Detector →</span>
                </Link>

                <Link
                  to="/qr"
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold text-content-secondary hover:text-white bg-background-panel/80 hover:bg-background-card transition-all border border-border"
                >
                  <QrCode className="w-4 h-4 text-brand-cyan" />
                  <span>Vision QR Studio</span>
                </Link>
              </div>

              {/* Mini trust checklist */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-content-secondary">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-cyan" />
                  <span>Zero Cloud Uploads</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-cyan" />
                  <span>Live 30 FPS Stream</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-cyan" />
                  <span>YOLO11n + Vision QR</span>
                </div>
              </div>
            </motion.div>

            {/* RIGHT COLUMN — REALISTIC COMPUTER VISION VISUALIZATION */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="lg:col-span-6 relative"
            >
              <div className="relative rounded-2xl overflow-hidden bg-background-secondary border border-border shadow-2xl shadow-black/80 aspect-[16/10] group">
                {/* Simulated Street / Workstation Camera Scene */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0B1528] via-[#07101E] to-[#040914] flex items-center justify-center">
                  {/* Grid background texture */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        'linear-gradient(rgba(47, 128, 255, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(47, 128, 255, 0.15) 1px, transparent 1px)',
                      backgroundSize: '32px 32px',
                    }}
                  />

                  {/* Simulated City Scene graphic */}
                  <div className="relative w-full h-full p-8 flex items-center justify-center opacity-70">
                    <div className="w-full h-full rounded-xl bg-gradient-to-tr from-slate-900/90 to-blue-950/40 border border-white/[0.05] relative overflow-hidden flex items-end justify-around pb-6 px-4">
                      {/* Stylized vector silhouettes for scene */}
                      <div className="w-16 h-36 bg-blue-900/30 rounded-t-lg border-t border-blue-500/20" />
                      <div className="w-24 h-48 bg-blue-900/40 rounded-t-lg border-t border-cyan-500/20" />
                      <div className="w-20 h-28 bg-blue-900/20 rounded-t-lg border-t border-blue-500/20" />
                      <div className="w-32 h-56 bg-blue-900/50 rounded-t-lg border-t border-brand-blue/30" />
                    </div>
                  </div>
                </div>

                {/* Radar Scanline Animation */}
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-brand-cyan to-transparent animate-scan pointer-events-none opacity-60" />

                {/* Simulated YOLO Bounding Boxes Overlay */}
                <div className="absolute inset-0 p-4 pointer-events-none">
                  {currentDetections.map((box, idx) => (
                    <motion.div
                      key={`${box.label}-${idx}`}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      style={{
                        left: box.x,
                        top: box.y,
                        width: box.w,
                        height: box.h,
                        borderColor: box.color,
                      }}
                      className="absolute border-2 rounded-md shadow-glow-sm"
                    >
                      {/* Corner bracket accents */}
                      <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-white" />
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-white" />
                      <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-white" />
                      <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-white" />

                      {/* Label Tag */}
                      <div
                        style={{ backgroundColor: box.color }}
                        className="absolute -top-6 left-0 px-2 py-0.5 rounded text-[11px] font-bold text-white font-mono flex items-center gap-1.5 shadow-md"
                      >
                        <span>{box.label}</span>
                        <span className="opacity-90 font-normal">{box.conf}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Floating HUD Telemetry Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-md bg-background-panel/90 backdrop-blur-md border border-white/10 text-[11px] font-mono text-white">
                  <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
                  <span>30 FPS</span>
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-2 px-2.5 py-1 rounded-md bg-background-panel/90 backdrop-blur-md border border-white/10 text-[11px] font-mono text-brand-cyan">
                  <span>{currentDetections.length} Objects</span>
                </div>

                <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-md bg-background-panel/90 backdrop-blur-md border border-white/10 text-[11px] font-mono text-white">
                  <span className="text-content-secondary">CONF:</span>
                  <span className="text-brand-cyan font-semibold">94.2%</span>
                </div>

                <div className="absolute bottom-3 right-3 flex items-center gap-2 px-2.5 py-1 rounded-md bg-background-panel/90 backdrop-blur-md border border-white/10 text-[11px] font-mono text-white">
                  <span className="text-content-secondary">LATENCY:</span>
                  <span className="text-brand-blue-bright font-semibold">12.4ms</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PERFORMANCE METRICS SECTION */}
      <section className="py-12 bg-background-secondary/70 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {metrics.map((m, idx) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-5 sm:p-6 rounded-xl bg-background-panel border border-border hover:border-brand-blue/30 transition-all shadow-card group"
              >
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight group-hover:text-brand-cyan transition-colors">
                  {m.value}
                </div>
                <div className="text-xs font-mono font-bold text-brand-blue uppercase tracking-wider mt-1.5">
                  {m.label}
                </div>
                <p className="text-xs text-content-secondary mt-1 hidden sm:block leading-relaxed">
                  {m.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 md:py-28 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-widest">
              SUPERCHARGED INTELLIGENCE
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Intelligent Vision. Simplified.
            </h3>
            <p className="text-sm sm:text-base text-content-secondary">
              Everything required to deploy, inspect, and analyze high-throughput real-time computer vision models.
            </p>

            {/* Category Filter Tabs */}
            <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-background-panel border border-border text-xs font-semibold mt-4">
              {[
                { id: 'all', label: 'All Capabilities' },
                { id: 'detection', label: 'Object Detection' },
                { id: 'qr', label: 'Vision QR' },
                { id: 'telemetry', label: 'Telemetry' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setFeatureCategory(c.id as any)}
                  className={`px-3.5 py-1.5 rounded-lg transition-all ${
                    featureCategory === c.id
                      ? 'bg-brand-blue text-white shadow-glow-sm'
                      : 'text-content-secondary hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeatures.map((f, idx) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.06 }}
                onClick={f.action}
                className="p-6 rounded-2xl bg-background-panel border border-border hover:border-brand-blue/50 hover:shadow-glow-sm transition-all shadow-card group cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-blue/20 transition-all">
                    {f.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2 group-hover:text-brand-cyan transition-colors flex items-center justify-between">
                      <span>{f.title}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-brand-cyan" />
                    </h4>
                    <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>

                {/* Action trigger button */}
                <div className="pt-5 mt-4 border-t border-white/[0.05] flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-cyan flex items-center gap-1 group-hover:underline">
                    {f.actionText}
                  </span>
                  <span className="text-[10px] font-mono text-content-muted uppercase px-2 py-0.5 rounded bg-background-secondary">
                    {f.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-20 bg-background-secondary/50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-widest">
              WORKFLOW TIMELINE
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              How It Works
            </h3>
            <p className="text-sm sm:text-base text-content-secondary">
              From raw video input to categorized bounding boxes in four streamlined steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {steps.map((s, idx) => (
              <div
                key={s.step}
                className="p-6 rounded-xl bg-background-panel border border-border relative overflow-hidden group hover:border-brand-blue/40 transition-colors"
              >
                <div className="text-4xl font-black font-mono text-brand-blue/20 mb-3 group-hover:text-brand-blue/40 transition-colors">
                  {s.step}
                </div>
                <h4 className="text-base font-bold text-white mb-2">{s.title}</h4>
                <p className="text-xs text-content-secondary leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERACTIVE SYSTEM ARCHITECTURE & TECHNOLOGIES SECTION */}
      <section id="technology" className="py-20 md:py-28 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-widest">
              SYSTEM ARCHITECTURE
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Powered by Modern Computer Vision
            </h3>
            <p className="text-sm sm:text-base text-content-secondary">
              End-to-end engineered with Ultralytics YOLO11n, OpenCV, FastAPI, and React.
            </p>
          </div>

          {/* Interactive Pipeline Stage Selector */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {architectureStages.map((item, idx) => {
              const isSelected = activeStageIndex === idx;
              return (
                <button
                  key={item.title}
                  onClick={() => setActiveStageIndex(idx)}
                  className={`p-4 rounded-xl text-left border transition-all flex flex-col items-center sm:items-start text-center sm:text-left ${
                    isSelected
                      ? 'bg-brand-blue/15 border-brand-cyan shadow-glow-sm'
                      : 'bg-background-panel border-border hover:border-brand-blue/40 hover:bg-background-card'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="p-2 rounded-lg bg-background-secondary">
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-mono font-bold text-brand-cyan">
                      {item.stage}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-white mb-0.5">{item.title}</h5>
                  <p className="text-[10px] text-content-muted truncate w-full">{item.subtitle}</p>
                </button>
              );
            })}
          </div>

          {/* Deep Stage Inspector Drawer */}
          <div className="p-6 sm:p-8 rounded-2xl bg-background-panel border border-border shadow-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Info Column */}
            <div className="lg:col-span-5 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-brand-blue/20 text-brand-cyan border border-brand-blue/30">
                    STAGE {currentStage.stage}
                  </span>
                  <span className="text-xs text-content-muted font-mono">
                    Latency: <strong className="text-white">{currentStage.latency}</strong>
                  </span>
                </div>
                <h4 className="text-2xl font-extrabold text-white tracking-tight">
                  {currentStage.title}
                </h4>
                <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                  {currentStage.desc}
                </p>
              </div>

              {/* Telemetry specs box */}
              <div className="p-4 rounded-xl bg-background-secondary border border-border space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-content-muted">Processing Time:</span>
                  <span className="text-brand-cyan font-bold">{currentStage.latency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-content-muted">Tensor / Data Format:</span>
                  <span className="text-white">{currentStage.tensor}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-content-muted">Hardware Device:</span>
                  <span className="text-brand-blue-bright">CPU / CUDA Auto</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to="/detector"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-blue hover:bg-brand-blue-bright transition-all shadow-glow-sm"
                >
                  <span>Test in Live Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  to="/detector/model"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-content-secondary hover:text-white bg-background-secondary border border-border hover:bg-white/[0.04] transition-all"
                >
                  <Cpu className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>Model Configurations</span>
                </Link>
              </div>
            </div>

            {/* Right Live Code Block */}
            <div className="lg:col-span-7 space-y-2">
              <div className="flex items-center justify-between px-3 py-2 rounded-t-xl bg-[#080E1A] border-x border-t border-border text-xs font-mono text-content-muted">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-brand-cyan" />
                  <span>Pipeline Implementation</span>
                </div>
                <button
                  onClick={() => handleCopyCode(currentStage.code)}
                  className="flex items-center gap-1 text-content-secondary hover:text-white transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-b-xl bg-[#040810] border border-border text-xs font-mono text-cyan-300/90 overflow-x-auto leading-relaxed">
                <code>{currentStage.code}</code>
              </pre>
            </div>
          </div>

          {/* Tech Stack Pills */}
          <div className="pt-6 border-t border-white/[0.06] flex flex-wrap items-center justify-center gap-3 text-xs">
            {[
              { name: 'Ultralytics YOLO11n', link: 'https://ultralytics.com' },
              { name: 'OpenCV 4.10+', link: 'https://opencv.org' },
              { name: 'FastAPI 0.115+', link: 'https://fastapi.tiangolo.com' },
              { name: 'PyTorch 2.6', link: 'https://pytorch.org' },
              { name: 'React 18 & Vite', link: 'https://react.dev' },
              { name: 'Tailwind CSS', link: 'https://tailwindcss.com' },
              { name: 'HTML5 WebRTC Canvas', link: '/detector' },
            ].map((tech) => (
              <span
                key={tech.name}
                className="px-3 py-1.5 rounded-lg bg-background-secondary border border-border text-content-secondary hover:text-white hover:border-brand-blue/30 transition-all font-mono"
              >
                {tech.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-gradient-to-b from-background to-background-secondary border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to See AI in Action?
          </h2>
          <p className="text-base sm:text-lg text-content-secondary max-w-xl mx-auto">
            Launch the live detector or test Vision QR scanning directly from your browser.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/detector"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-brand-blue to-brand-blue-bright hover:opacity-95 transition-all shadow-glow-md hover:shadow-glow-cyan active:scale-95"
            >
              <Scan className="w-5 h-5" />
              <span>Launch Object Detector →</span>
            </Link>

            <Link
              to="/qr"
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl text-base font-semibold text-content-secondary hover:text-white bg-background-panel border border-border hover:bg-background-card transition-all"
            >
              <QrCode className="w-5 h-5 text-brand-cyan" />
              <span>Open Vision QR Studio</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

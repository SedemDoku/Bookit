'use client';

import { useEffect } from 'react';

export default function HomePage() {
  useEffect(() => {
    // Parallax scroll effect
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const shapes = document.querySelectorAll('.shape');
      shapes.forEach((shape, i) => {
        shape.style.transform = `translateY(${scrolled * (0.1 + i * 0.05)}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll);

    // Intersection Observer for animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    document.querySelectorAll('.feature-item, .showcase-card').forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'all 0.6s ease-out';
      observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --primary: #ff6b35;
          --primary-hover: #e55a2b;
          --purple: #8b5cf6;
          --pink: #ec4899;
          --orange: #f97316;
          --blue: #3b82f6;
          --cyan: #06b6d4;
          --green: #22c55e;
          --bg: #0a0a0a;
          --surface: #111111;
          --surface-elevated: #1a1a1a;
          --border: #2a2a2a;
          --text: #ffffff;
          --text-muted: #a0a0a0;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, sans-serif;
          background: var(--bg);
          color: var(--text);
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        .bg-gradient {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          background: radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(255, 107, 53, 0.15) 0%, transparent 50%);
        }

        .floating-shapes {
          position: fixed;
          width: 100%;
          height: 100%;
          z-index: -1;
          overflow: hidden;
        }

        .shape {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          animation: float 20s infinite;
        }

        .shape:nth-child(1) {
          width: 400px;
          height: 400px;
          background: var(--purple);
          top: -200px;
          left: 10%;
          animation-delay: 0s;
        }

        .shape:nth-child(2) {
          width: 300px;
          height: 300px;
          background: var(--primary);
          top: 50%;
          right: 10%;
          animation-delay: 5s;
        }

        .shape:nth-child(3) {
          width: 350px;
          height: 350px;
          background: var(--pink);
          bottom: -100px;
          left: 50%;
          animation-delay: 10s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        nav {
          position: fixed;
          top: 0;
          width: 100%;
          padding: 20px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 1000;
          background: rgba(10, 10, 10, 0.7);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }

        .logo {
          font-size: 24px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .nav-links {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .nav-link {
          color: var(--text);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s;
        }

        .nav-link:hover {
          color: var(--primary);
        }

        .btn {
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
          display: inline-block;
        }

        .btn-primary {
          background: var(--primary);
          color: white;
        }

        .btn-primary:hover {
          background: var(--primary-hover);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(255, 107, 53, 0.3);
        }

        .btn-white {
          background: white;
          color: var(--bg);
          padding: 16px 40px;
          font-size: 18px;
        }

        .btn-white:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .hero {
          padding: 160px 40px 100px;
          text-align: center;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--surface-elevated);
          padding: 10px 16px;
          border-radius: 24px;
          border: 1px solid var(--border);
          margin-bottom: 40px;
          animation: slideDown 0.8s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .pulse-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          background: var(--green);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .hero h1 {
          font-size: 68px;
          font-weight: 900;
          margin-bottom: 32px;
          line-height: 1.2;
          animation: slideDown 0.8s ease-out 0.1s both;
        }

        .gradient-text {
          background: linear-gradient(135deg, var(--primary), var(--pink), var(--purple));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 18px;
          color: var(--text-muted);
          margin-bottom: 48px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
          animation: slideDown 0.8s ease-out 0.2s both;
        }

        .hero-cta {
          display: flex;
          gap: 16px;
          justify-content: center;
          margin-bottom: 80px;
          animation: slideDown 0.8s ease-out 0.3s both;
        }

        .card-showcase {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .showcase-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 32px 24px;
          text-align: center;
          transition: all 0.3s;
          cursor: pointer;
        }

        .showcase-card:hover {
          border-color: var(--primary);
          background: var(--surface-elevated);
          transform: translateY(-8px);
        }

        .card-icon {
          font-size: 40px;
          margin-bottom: 16px;
        }

        .card-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .card-desc {
          color: var(--text-muted);
          line-height: 1.6;
          font-size: 14px;
        }

        .features {
          padding: 120px 20px;
          background: var(--bg);
        }

        .section-header {
          max-width: 900px;
          margin: 0 auto 80px;
          text-align: center;
        }

        .section-tag {
          display: inline-block;
          background: var(--surface);
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: var(--primary);
          margin-bottom: 24px;
        }

        .section-header h2 {
          font-size: 48px;
          font-weight: 900;
          margin-bottom: 24px;
        }

        .feature-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
        }

        .feature-item {
          position: relative;
          padding: 32px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          transition: all 0.3s;
          cursor: pointer;
        }

        .feature-item::after {
          content: '';
          position: absolute;
          inset: 0;
          bottom: -2px;
          background: linear-gradient(135deg, var(--primary), var(--purple), var(--pink));
          border-radius: 24px;
          opacity: 0;
          z-index: -1;
          transition: opacity 0.4s;
        }

        .feature-item:hover::after {
          opacity: 0.3;
        }

        .feature-item:hover {
          transform: translateY(-4px);
        }

        .feature-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          font-size: 24px;
        }

        .feature-item:nth-child(1) .feature-icon {
          background: linear-gradient(135deg, var(--blue), #2563eb);
        }

        .feature-item:nth-child(2) .feature-icon {
          background: linear-gradient(135deg, var(--purple), #7c3aed);
        }

        .feature-item:nth-child(3) .feature-icon {
          background: linear-gradient(135deg, var(--pink), #db2777);
        }

        .feature-item:nth-child(4) .feature-icon {
          background: linear-gradient(135deg, var(--orange), #ea580c);
        }

        .feature-item:nth-child(5) .feature-icon {
          background: linear-gradient(135deg, var(--green), #16a34a);
        }

        .feature-item:nth-child(6) .feature-icon {
          background: linear-gradient(135deg, var(--cyan), #0891b2);
        }

        h3 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .feature-text {
          color: var(--text-muted);
          line-height: 1.7;
        }

        .canvas-preview {
          padding: 120px 20px;
          background: var(--surface);
          position: relative;
        }

        .preview-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        .canvas-visual {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 40px;
          position: relative;
          overflow: hidden;
          min-height: 400px;
        }

        .canvas-node {
          position: absolute;
          background: var(--surface-elevated);
          border: 2px solid var(--border);
          border-radius: 16px;
          padding: 20px 28px;
          font-weight: 600;
          animation: floatNode 4s ease-in-out infinite;
        }

        @keyframes floatNode {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .node-1 {
          top: 60px;
          left: 60px;
          animation-delay: 0s;
          background: linear-gradient(135deg, rgba(255, 107, 53, 0.2), rgba(255, 107, 53, 0.05));
          border-color: var(--primary);
        }

        .node-2 {
          top: 140px;
          right: 80px;
          animation-delay: 1s;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05));
          border-color: var(--purple);
        }

        .node-3 {
          bottom: 80px;
          left: 120px;
          animation-delay: 2s;
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.05));
          border-color: var(--green);
        }

        .cta-section {
          padding: 120px 20px;
          text-align: center;
        }

        .cta-box {
          max-width: 800px;
          margin: 0 auto;
          background: var(--primary);
          border-radius: 32px;
          padding: 80px 40px;
          position: relative;
          overflow: hidden;
        }

        .cta-box::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          animation: rotate 20s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .cta-box h2 {
          position: relative;
          z-index: 1;
          color: white;
          font-size: 48px;
          margin-bottom: 16px;
        }

        .cta-box p {
          position: relative;
          z-index: 1;
          color: rgba(255, 255, 255, 0.9);
          font-size: 18px;
          margin-bottom: 40px;
        }

        footer {
          padding: 60px 40px;
          border-top: 1px solid var(--border);
          text-align: center;
        }

        .footer-logo {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .footer-links {
          display: flex;
          gap: 32px;
          justify-content: center;
          margin-bottom: 20px;
        }

        .footer-link {
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.3s;
        }

        .footer-link:hover {
          color: var(--text);
        }

        .copyright {
          color: var(--text-muted);
          font-size: 14px;
        }

        @media (max-width: 768px) {
          nav {
            padding: 16px 20px;
          }

          .nav-links {
            gap: 16px;
          }

          .card-showcase {
            grid-template-columns: 1fr;
          }

          .preview-container {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .canvas-visual {
            order: -1;
          }

          .feature-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="bg-gradient"></div>
      <div className="floating-shapes">
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>

      <nav>
        <div className="logo">
          <img src="/logo.png" alt="BookIt Logo" style={{ height: '32px', width: 'auto' }} />
          <span>BookIt</span>
        </div>
        <div className="nav-links">
          <a href="/login" className="nav-link">Login</a>
          <a href="/signup" className="btn btn-primary">Sign Up</a>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-badge">
          <span className="pulse-dot"></span>
          <span>Visual Knowledge Management</span>
        </div>
        <h1>
          Your digital memory,<br />
          <span className="gradient-text">reimagined</span>
        </h1>
        <p className="hero-subtitle">
          Save, connect, and visualize everything that matters. Build your personal knowledge graph with an interface that thinks the way you do.
        </p>
        <div className="hero-cta">
          <a href="/app" className="btn btn-primary">Go to Dashboard</a>
          <a href="/login" className="btn" style={{ background: 'var(--surface-elevated)', color: 'var(--text)', border: '1px solid var(--border)' }}>Login</a>
        </div>

        <div className="card-showcase">
          <div className="showcase-card">
            <div className="card-icon video">🎥</div>
            <h3 className="card-title">Video Library</h3>
            <p className="card-desc">Save and organize video content with automatic thumbnails and playback</p>
          </div>
          <div className="showcase-card">
            <div className="card-icon image">🖼️</div>
            <h3 className="card-title">Image Collections</h3>
            <p className="card-desc">Beautiful grid layouts for your visual inspirations and references</p>
          </div>
          <div className="showcase-card">
            <div className="card-icon link">🔗</div>
            <h3 className="card-title">Smart Links</h3>
            <p className="card-desc">Rich previews with metadata extraction and automatic categorization</p>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="section-header">
          <div className="section-tag">Features</div>
          <h2>Built for how you think</h2>
          <p className="hero-subtitle" style={{ animation: 'none' }}>Everything you need to organize your digital life in one powerful platform</p>
        </div>

        <div className="feature-grid">
          <div className="feature-item">
            <div className="feature-icon">🎯</div>
            <h3>Infinite Canvas</h3>
            <p className="feature-text">Arrange bookmarks freely in 2D space. Create visual mind maps and connect related ideas with arrows.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Search</h3>
            <p className="feature-text">Find anything instantly with full-text search, smart filters, and keyboard shortcuts.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🎨</div>
            <h3>Visual First</h3>
            <p className="feature-text">Rich previews for every type of content. See images, videos, and websites at a glance.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📁</div>
            <h3>Smart Collections</h3>
            <p className="feature-text">Organize with nested folders, tags, and auto-categorization powered by AI.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🔄</div>
            <h3>Real-time Sync</h3>
            <p className="feature-text">Access your bookmarks anywhere. Changes sync instantly across all your devices.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🤝</div>
            <h3>Collaboration</h3>
            <p className="feature-text">Share collections with your team. Comment, annotate, and build knowledge together.</p>
          </div>
        </div>
      </section>

      <section className="canvas-preview">
        <div className="preview-container">
          <div className="canvas-visual">
            <div className="canvas-node node-1">Research 📚</div>
            <div className="canvas-node node-2">Design 🎨</div>
            <div className="canvas-node node-3">Development 💻</div>
          </div>
          <div>
            <div className="section-tag">Canvas Mode</div>
            <h2>Think spatially</h2>
            <p className="hero-subtitle" style={{ textAlign: 'left', animation: 'none', marginLeft: 0 }}>
              Break free from lists and folders. Position bookmarks anywhere on an infinite canvas, draw connections, and create visual stories with your content.
            </p>
            <ul style={{ marginTop: '32px', listStyle: 'none' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--green)', fontSize: '20px' }}>✓</span> Drag and drop positioning
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--green)', fontSize: '20px' }}>✓</span> Connect related bookmarks
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--green)', fontSize: '20px' }}>✓</span> Zoom and pan smoothly
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-box">
          <h2>Ready to transform your bookmarks?</h2>
          <p>Join thousands already organizing their digital lives visually</p>
          <a href="/signup" className="btn btn-white">Get Started — It's Free</a>
        </div>
      </section>

      <footer>
        <div className="footer-logo">
          <img src="/logo.png" alt="BookIt" style={{ height: '24px', width: 'auto', verticalAlign: 'middle', marginRight: '8px' }} />
          BookIt
        </div>
        <div className="footer-links">
          <a href="/login" className="footer-link">Login</a>
          <a href="/signup" className="footer-link">Sign Up</a>
        </div>
        <p className="copyright">© 2024 BookIt. All rights reserved.</p>
      </footer>
    </>
  );
}

import { ArrowDown, ArrowRight, Code2, LockKeyhole, Sparkles } from "lucide-react";
import { Link } from "wouter";
import "./public-home.css";

export default function PublicHome() {
  return (
    <div className="public-home">
      <header className="public-nav">
        <Link href="/" className="public-brand" aria-label="Nabeen home">
          <span className="public-brand-mark" aria-hidden="true"><i /></span>
          <span>nabeen</span>
        </Link>
        <nav className="public-nav-links" aria-label="Main navigation">
          <a href="#how-it-works" data-testid="link-public-how-it-works">How it works</a>
          <Link href="/sign-in" data-testid="link-public-sign-in">Sign in</Link>
          <Link href="/sign-up" className="public-nav-cta" data-testid="link-public-sign-up">Get started <ArrowRight /></Link>
        </nav>
      </header>

      <main>
        <section className="public-hero">
          <div className="public-hero-copy">
            <div className="public-eyebrow"><Sparkles /> Your personal coding partner</div>
            <h1>Make room for the idea you keep <em>coming back to.</em></h1>
            <p className="public-lede">
              Nabeen is a private workspace to shape projects with an AI partner.
              Work through code changes in plain language, keep your files together,
              and decide what personal context is worth remembering.
            </p>
            <div className="public-hero-actions">
              <Link href="/sign-up" className="public-button public-button-primary" data-testid="button-public-start">
                Open your workbench <ArrowRight />
              </Link>
              <Link href="/sign-in" className="public-button public-button-quiet" data-testid="button-public-return">
                I already have an account
              </Link>
            </div>
            <div className="public-privacy-note"><LockKeyhole /> Private to the verified owner. Memories are only saved when asked.</div>
          </div>

          <div className="public-workbench-art" aria-label="Illustration of a coding conversation and project files">
            <div className="public-art-top"><span /><span /><span /><i>nabeen / workbench</i></div>
            <div className="public-art-body">
              <div className="public-art-files">
                <div className="public-art-section-label">PROJECT FILES</div>
                <div className="public-art-file active"><Code2 /> index.html</div>
                <div className="public-art-file"><Code2 /> styles.css</div>
                <div className="public-art-file"><Code2 /> app.js</div>
                <div className="public-art-rule" />
                <div className="public-art-file muted"><span className="public-art-dot" /> saved locally</div>
              </div>
              <div className="public-art-editor">
                <div className="public-art-editor-bar"><span>index.html</span><span>saved</span></div>
                <div className="public-art-code">
                  <div><b>01</b><span className="code-tag">&lt;main&gt;</span></div>
                  <div><b>02</b><span className="code-space" /><span className="code-tag">&lt;h1&gt;</span></div>
                  <div><b>03</b><span className="code-space double" /><span className="code-copy">A good place to start.</span></div>
                  <div><b>04</b><span className="code-space" /><span className="code-tag">&lt;/h1&gt;</span></div>
                  <div><b>05</b><span className="code-tag">&lt;/main&gt;</span></div>
                </div>
                <div className="public-art-chat">
                  <div className="public-art-chat-label">YOU</div>
                  <p>Can you make this feel a little more like me?</p>
                  <div className="public-art-agent"><span className="public-agent-glyph"><Sparkles /></span><span>Nabeen can read and edit these files with you.</span></div>
                </div>
              </div>
            </div>
            <div className="public-art-caption"><span className="public-caption-dot" /> a focused place to build, one change at a time</div>
          </div>
          <a className="public-scroll-cue" href="#how-it-works" aria-label="Scroll to learn how Nabeen works"><ArrowDown /></a>
        </section>

        <section className="public-principles" id="how-it-works">
          <div className="public-section-heading">
            <div className="public-eyebrow">A quieter way to build</div>
            <h2>Tools that stay out of the way.<br /><em>Context that stays yours.</em></h2>
          </div>
          <div className="public-principle-grid">
            <article className="public-principle">
              <span className="public-principle-number">01</span>
              <h3>Work with real project files</h3>
              <p>Keep text-based source files in a private project. Ask Nabeen to explain, review, or make focused edits you can inspect and save.</p>
            </article>
            <article className="public-principle">
              <span className="public-principle-number">02</span>
              <h3>Pick up where you left off</h3>
              <p>Conversations are saved with their project, so you can return to an idea without rebuilding its context each time.</p>
            </article>
            <article className="public-principle">
              <span className="public-principle-number">03</span>
              <h3>Choose what Nabeen remembers</h3>
              <p>Personal memories are explicit and editable. Nothing is added just because the agent guessed it might be useful.</p>
            </article>
          </div>
          <div className="public-scope-note">
            <span className="public-scope-icon"><Code2 /></span>
            <p><strong>Built in honest steps.</strong> This first workbench stores and edits project files. Running code, live previews, and deployments are not available yet.</p>
          </div>
        </section>
      </main>

      <footer className="public-footer">
        <Link href="/" className="public-brand"><span className="public-brand-mark" aria-hidden="true"><i /></span><span>nabeen</span></Link>
        <span>A personal workspace, built one useful piece at a time.</span>
        <Link href="/sign-in" data-testid="link-public-footer-sign-in">Sign in <ArrowRight /></Link>
      </footer>
    </div>
  );
}
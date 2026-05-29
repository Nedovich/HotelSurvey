import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#fff8f5] text-[#251912]">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative flex min-h-screen flex-col bg-[#fff8f5] px-6 py-8 sm:px-10 lg:px-[120px]">
          <div className="flex items-center gap-2.5 text-[#974800]">
            <div className="flex h-7 w-8 items-center justify-center">
              <span className="text-[20px] leading-none">★</span>
            </div>
            <span className="font-heading text-[20px] font-bold leading-7">
              Hospita
            </span>
          </div>

          <div className="flex flex-1 items-center">
            <div className="w-full max-w-[420px]">
              <div className="flex flex-col gap-2">
                <h1 className="font-heading text-[32px] font-bold leading-10 tracking-[-0.64px] text-[#251912]">
                  Welcome Back
                </h1>
                <p className="text-base leading-6 text-[#584235]">
                  Sign in to access your dashboard and insights.
                </p>
              </div>

              <div className="mt-6 rounded-xl border border-[#f5ded2] bg-white px-6 pb-6 pt-12 shadow-[0px_10px_15px_-3px_rgba(30,41,59,0.08)]">
                <LoginForm />
              </div>

              <p className="mt-6 text-center text-sm leading-5 text-[#584235]">
                Need help?{" "}
                <a
                  className="text-[#974800] transition-colors hover:text-[#7d3c00]"
                  href="mailto:support@hospita.com"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </section>

        <aside className="relative hidden min-h-screen overflow-hidden bg-[#ffeadf] lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(245,210,173,0.35),transparent_24%),linear-gradient(180deg,rgba(141,103,72,0.18)_0%,rgba(62,43,32,0.36)_56%,rgba(17,13,10,0.66)_100%),repeating-linear-gradient(90deg,rgba(255,255,255,0.12)_0px,rgba(255,255,255,0.12)_2px,transparent_2px,transparent_72px),linear-gradient(180deg,#8b715c_0%,#66503f_34%,#433127_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
          <div className="absolute inset-x-12 bottom-12 flex flex-col gap-2">
            <h2 className="max-w-[544px] font-heading text-[32px] font-bold leading-10 tracking-[-0.64px] text-white">
              Empowering Hospitality Insights
            </h2>
            <p className="max-w-[448px] text-[18px] leading-7 text-white/80">
              Streamline your operations, understand your guests, and elevate
              the standard of luxury service with data-driven precision.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

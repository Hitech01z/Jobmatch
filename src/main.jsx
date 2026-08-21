import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Globe2,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  Users,
  X,
  FileText,
  MapPin,
  Clock3,
} from "lucide-react";
import "./index.css";

const packages = [
  {
    key: "entry",
    icon: "🎓",
    name: "Entry Level",
    price: 49,
    desc: "A focused start for early-career job seekers.",
    items: [
      "3 matched jobs",
      "CV tailored to 3 roles",
      "3 cover letters",
    ],
  },
  {
    key: "professional",
    icon: "💼",
    name: "Professional",
    price: 99,
    desc: "More guidance for experienced professionals.",
    items: [
      "3 matched jobs",
      "Deeper CV tailoring",
      "3 cover letters",
      "LinkedIn / application guidance",
    ],
    popular: true,
  },
  {
    key: "manager",
    icon: "👔",
    name: "Manager",
    price: 149,
    desc: "More extensive research and application strategy.",
    items: [
      "Extensive job research",
      "Executive-style CV tailoring",
      "3 cover letters",
      "Application strategy",
    ],
  },
  {
    key: "director",
    icon: "🏢",
    name: "Director",
    price: 199,
    desc: "Targeted support for senior leadership searches.",
    items: [
      "Targeted senior-role research",
      "Executive CV",
      "Tailored applications",
      "Positioning guidance",
    ],
  },
  {
    key: "executive",
    icon: "⭐",
    name: "Executive",
    price: 299,
    desc: "Highly personalized support for executive searches.",
    items: [
      "5 highly targeted senior opportunities",
      "Executive CV optimization",
      "5 tailored cover letters",
      "LinkedIn positioning review",
      "Executive job-search strategy call",
      "Application tracking",
      "Follow-up support",
    ],
  },
];

const empty = {
  name: "",
  email: "",
  role: "",
  industry: "",
  location: "",
  workMode: "",
  experience: "",
  careerLevel: "",
  cv: null,
  message: "",
};

/*
 * Google Apps Script Web App endpoint.
 */
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxDlNniQ0J8wnQaGixgXxl4YtG7LmcxUknk12lBt1HV4_PWBLDvC_biiTNKfAb7gOmrmg/exec";


/*
 * Convert the uploaded CV into Base64 so it can be
 * sent to Google Apps Script and saved to Google Drive.
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        reject(new Error("Unable to read CV file."));
        return;
      }

      const parts = result.split(",");

      if (parts.length < 2 || !parts[1]) {
        reject(new Error("Unable to convert CV file."));
        return;
      }

      resolve(parts[1]);
    };

    reader.onerror = () => {
      reject(new Error("Unable to read CV file."));
    };

    reader.readAsDataURL(file);
  });
}


/*
 * Send the complete JobMatch lead to Google Apps Script.
 *
 * The Apps Script will:
 * 1. Save the lead to Google Sheets.
 * 2. Save the CV to Google Drive.
 * 3. Send an immediate Gmail alert.
 */
async function submitToGoogleScript(form) {
  const selectedPackage = packages.find(
    (pkg) => pkg.key === form.careerLevel
  );

  const cvBase64 = await fileToBase64(form.cv);

  const data = new URLSearchParams();

  data.append("name", form.name);
  data.append("email", form.email);

  data.append(
    "careerLevel",
    selectedPackage?.name || ""
  );

  data.append(
    "package",
    selectedPackage
      ? `$${selectedPackage.price}`
      : ""
  );

  data.append("role", form.role);
  data.append("industry", form.industry || "");
  data.append("location", form.location);
  data.append("workMode", form.workMode);
  data.append("experience", form.experience);
  data.append("message", form.message || "");

  if (form.cv) {
    data.append("cvName", form.cv.name);
    data.append(
      "cvType",
      form.cv.type || "application/octet-stream"
    );
    data.append("cvData", cvBase64);
  }

  await fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    body: data,
  });
}


function Field({ label, required, children }) {
  return (
    <div className="field block">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
        {required && (
          <span className="ml-1 text-blue-600">*</span>
        )}
      </span>

      {children}
    </div>
  );
}


function App() {
  const [menu, setMenu] = useState(false);
  const [form, setForm] = useState(empty);
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };


  async function submit(e) {
    e.preventDefault();

    if (!form.careerLevel) {
      setSubmissionError(
        "Please select your career level."
      );
      return;
    }

    setSubmissionError("");
    setBusy(true);

    try {
      await submitToGoogleScript(form);

      setSubmitted(true);
    } catch (error) {
      console.error(
        "JobMatch submission error:",
        error
      );

      setSubmissionError(
        "We couldn't submit your request. Please check your connection and try again."
      );
    } finally {
      setBusy(false);
    }
  }


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

          <a
            href="#home"
            className="flex items-center gap-3"
            onClick={() => setMenu(false)}
          >
            <span className="grid size-10 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <BriefcaseBusiness size={20} />
            </span>

            <span className="text-xl font-black tracking-tight">
              Job<span className="text-blue-600">Match</span>
            </span>
          </a>


          <nav className="hidden items-center gap-8 md:flex">

            <a
              href="#how"
              className="text-sm font-bold text-slate-600 hover:text-slate-950"
            >
              How it works
            </a>

            <a
              href="#services"
              className="text-sm font-bold text-slate-600 hover:text-slate-950"
            >
              Services
            </a>

            <a
              href="#pricing"
              className="text-sm font-bold text-slate-600 hover:text-slate-950"
            >
              Pricing
            </a>

            <a
              href="#who"
              className="text-sm font-bold text-slate-600 hover:text-slate-950"
            >
              Who we help
            </a>

            <a
              href="#match"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-extrabold text-white hover:bg-blue-600"
            >
              Find my jobs
            </a>

          </nav>


          <button
            className="grid size-10 place-items-center rounded-xl border border-slate-200 md:hidden"
            onClick={() => setMenu((value) => !value)}
            aria-label="Open navigation"
          >
            {menu ? (
              <X size={20} />
            ) : (
              <Menu size={20} />
            )}
          </button>

        </div>


        {menu && (
          <nav className="border-t border-slate-200 bg-white px-5 py-4 md:hidden">
            {[
              ["How it works", "#how"],
              ["Services", "#services"],
              ["Pricing", "#pricing"],
              ["Who we help", "#who"],
              ["Find my jobs", "#match"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenu(false)}
                className="block rounded-xl px-3 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                {label}
              </a>
            ))}
          </nav>
        )}

      </header>


      <main id="home">

        {/* HERO */}
        <section className="relative overflow-hidden bg-white">

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(37,99,235,.14),transparent_32%),radial-gradient(circle_at_15%_45%,rgba(59,130,246,.07),transparent_28%)]" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:pb-28 lg:pt-24">

            <div>

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-blue-700">
                <Globe2 size={14} />
                Personalized job search
              </div>

              <h1 className="max-w-3xl text-5xl font-black leading-[.98] tracking-[-.045em] text-slate-950 sm:text-6xl lg:text-7xl">
                Find the right jobs.
                <span className="mt-2 block text-blue-600">
                  Apply with confidence.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Tell us what you do, where you want to work, and what you're
                looking for. JobMatch researches active opportunities that fit
                your career, skills, experience, and preferred location.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">

                <a
                  href="#match"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-4 text-sm font-black text-white shadow-xl shadow-blue-600/20 hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Find my jobs
                  <ArrowRight size={18} />
                </a>

                <a
                  href="#how"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-4 text-sm font-black text-slate-700 hover:bg-slate-50"
                >
                  See how it works
                </a>

              </div>


              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-500">

                <span className="flex items-center gap-2">
                  <CheckCircle2
                    size={17}
                    className="text-blue-600"
                  />
                  International opportunities
                </span>

                <span className="flex items-center gap-2">
                  <CheckCircle2
                    size={17}
                    className="text-blue-600"
                  />
                  Human-reviewed matching
                </span>

              </div>

            </div>


            <div className="relative">

              <div className="absolute -inset-5 rounded-[2rem] bg-blue-600/10 blur-3xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-2xl sm:p-8">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs font-black uppercase tracking-[.18em] text-blue-400">
                      Your job search
                    </p>

                    <h2 className="mt-2 text-2xl font-black">
                      Built around you.
                    </h2>
                  </div>

                  <span className="grid size-12 place-items-center rounded-2xl bg-white/10">
                    <Target size={22} />
                  </span>

                </div>


                <div className="mt-8 space-y-3">

                  {[
                    [
                      "Target role",
                      "Software Engineer",
                      BriefcaseBusiness,
                    ],
                    [
                      "Location",
                      "Canada · Remote · UK",
                      MapPin,
                    ],
                    [
                      "Experience",
                      "3+ years",
                      Clock3,
                    ],
                  ].map(([label, value, Icon]) => (
                    <div
                      key={label}
                      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.06] p-4"
                    >

                      <span className="grid size-10 place-items-center rounded-xl bg-blue-500/15 text-blue-300">
                        {Icon ? <Icon size={18} /> : null}
                      </span>

                      <div>

                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          {label}
                        </p>

                        <p className="mt-1 text-sm font-bold">
                          {value}
                        </p>

                      </div>

                    </div>
                  ))}

                </div>


                <div className="mt-5 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4">

                  <div className="flex gap-3">

                    <Sparkles
                      className="mt-0.5 shrink-0 text-blue-300"
                      size={18}
                    />

                    <p className="text-sm font-semibold leading-6 text-slate-200">
                      We focus on relevant, active opportunities—not a random
                      list of job links.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* HOW IT WORKS */}
        <section
          id="how"
          className="scroll-mt-24 border-y border-slate-200 bg-slate-50"
        >

          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">

            <div className="max-w-2xl">

              <p className="text-sm font-black uppercase tracking-[.18em] text-blue-600">
                How it works
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                A simpler way to search.
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                You don't need another complicated job board. Give us your
                requirements and we'll do the research.
              </p>

            </div>


            <div className="mt-12 grid gap-5 md:grid-cols-3">

              {[
                [
                  "01",
                  "Tell us",
                  "Share your target role, skills, location, experience and work preference.",
                  Users,
                ],
                [
                  "02",
                  "We find",
                  "We research active opportunities that closely match your requirements.",
                  Search,
                ],
                [
                  "03",
                  "You apply",
                  "Review the matches and choose the opportunities you want to pursue.",
                  CheckCircle2,
                ],
              ].map(([num, title, text, Icon]) => (

                <article
                  key={num}
                  className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:-translate-y-1 hover:shadow-xl"
                >

                  <div className="flex justify-between">

                    <span className="text-sm font-black text-blue-600">
                      {num}
                    </span>

                    <span className="grid size-11 place-items-center rounded-2xl bg-slate-100">
                      {Icon ? <Icon size={20} /> : null}
                    </span>

                  </div>

                  <h3 className="mt-12 text-xl font-black">
                    {title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {text}
                  </p>

                </article>

              ))}

            </div>

          </div>

        </section>


        {/* SERVICES */}
        <section
          id="services"
          className="scroll-mt-24 bg-white"
        >

          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">

            <div className="grid gap-10 lg:grid-cols-2 lg:items-end">

              <div>

                <p className="text-sm font-black uppercase tracking-[.18em] text-blue-600">
                  What we do
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                  More than finding job links.
                </h2>

              </div>

              <p className="max-w-2xl text-slate-600 leading-7 lg:justify-self-end">
                JobMatch combines personalized opportunity research with
                practical application support, so you can spend less time
                searching and more time applying to roles worth pursuing.
              </p>

            </div>


            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

              {[
                [
                  "Job opportunity research",
                  "We search for active opportunities aligned with your career goals.",
                  Search,
                ],
                [
                  "Personalized job matching",
                  "Your role, skills, experience and location shape the opportunities we recommend.",
                  Target,
                ],
                [
                  "CV tailoring",
                  "We can tailor your CV around the requirements of selected roles.",
                  FileText,
                ],
                [
                  "Cover letters",
                  "Get focused cover letters that connect your experience to the opportunity.",
                  Sparkles,
                ],
              ].map(([title, text, Icon]) => (

                <div
                  key={title}
                  className="rounded-3xl border border-slate-200 p-6"
                >

                  <span className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                    {Icon ? <Icon size={22} /> : null}
                  </span>

                  <h3 className="mt-6 font-black">
                    {title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {text}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </section>


        {/* WHO WE HELP */}
        <section
          id="who"
          className="scroll-mt-24 bg-slate-950 text-white"
        >

          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center lg:px-10 lg:py-24">

            <div>

              <p className="text-sm font-black uppercase tracking-[.18em] text-blue-400">
                Who we help
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Wherever you are in your career, start with a clearer search.
              </h2>

              <p className="mt-5 max-w-xl leading-7 text-slate-300">
                Whether you're starting out, moving up, changing industries,
                or targeting international opportunities, your search begins
                with your specific requirements.
              </p>

            </div>


            <div className="grid gap-3 sm:grid-cols-2">

              {[
                [
                  "Entry-level professionals",
                  "Find opportunities that fit your starting point.",
                ],
                [
                  "Experienced professionals",
                  "Target roles that match your skills and track record.",
                ],
                [
                  "Managers",
                  "Search for leadership opportunities aligned with your goals.",
                ],
                [
                  "Executives",
                  "Get focused support for senior and international searches.",
                ],
              ].map(([title, text]) => (

                <div
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/[.06] p-5"
                >

                  <CheckCircle2
                    className="text-blue-400"
                    size={20}
                  />

                  <h3 className="mt-4 font-black">
                    {title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {text}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </section>


        {/* PRICING */}
        <section
          id="pricing"
          className="scroll-mt-24 border-y border-slate-200 bg-slate-50"
        >

          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">

            <div className="max-w-3xl">

              <p className="text-sm font-black uppercase tracking-[.18em] text-blue-600">
                Choose your support
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Choose the level of support that fits your career.
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Your career level helps us understand how much research and
                application support you need.
              </p>

            </div>


            <div className="mt-12 grid gap-4 lg:grid-cols-5">

              {packages.map((pkg) => (

                <button
                  key={pkg.key}
                  type="button"
                  onClick={() =>
                    set("careerLevel", pkg.key)
                  }
                  className={`relative rounded-3xl border p-5 text-left transition hover:-translate-y-1 hover:shadow-xl ${
                    form.careerLevel === pkg.key
                      ? "border-blue-500 bg-white shadow-xl ring-4 ring-blue-500/10"
                      : "border-slate-200 bg-white"
                  }`}
                >

                  {pkg.popular && (
                    <span className="absolute -top-3 left-5 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                      Most popular
                    </span>
                  )}

                  <div className="text-2xl">
                    {pkg.icon}
                  </div>

                  <h3 className="mt-4 font-black">
                    {pkg.name}
                  </h3>

                  <p className="mt-2 text-3xl font-black">
                    ${pkg.price}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {pkg.desc}
                  </p>

                  <div className="mt-5 space-y-2">

                    {pkg.items.map((item) => (

                      <div
                        key={item}
                        className="flex gap-2 text-xs font-semibold leading-5 text-slate-600"
                      >

                        <span className="mt-1 text-blue-600">
                          ✓
                        </span>

                        {item}

                      </div>

                    ))}

                  </div>

                </button>

              ))}

            </div>


            {form.careerLevel && (

              <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm font-bold text-blue-900">

                Selected:{" "}

                {packages.find(
                  (x) => x.key === form.careerLevel
                )?.name}

                {" — $"}

                {
                  packages.find(
                    (x) => x.key === form.careerLevel
                  )?.price
                }

                <span className="ml-2 font-medium text-blue-700">
                  Your selection will be included with your job-matching
                  request.
                </span>

              </div>

            )}

          </div>

        </section>


        {/* JOB MATCH FORM */}
        <section
          id="match"
          className="scroll-mt-24 bg-white"
        >

          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">

            <div className="mx-auto max-w-3xl text-center">

              <p className="text-sm font-black uppercase tracking-[.18em] text-blue-600">
                Get started
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Tell us what you're looking for.
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Submit your job-search brief and we'll use it to research
                relevant active opportunities.
              </p>

            </div>


            <div className="mx-auto mt-12 max-w-4xl">

              {submitted ? (

                <div className="rounded-[2rem] border border-blue-100 bg-blue-50 p-10 text-center">

                  <span className="mx-auto grid size-16 place-items-center rounded-full bg-white text-blue-600 shadow-sm">
                    <CheckCircle2 size={32} />
                  </span>

                  <h3 className="mt-6 text-2xl font-black">
                    You're on the list.
                  </h3>

                  <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
                    Your job-search request has been captured. We'll use the
                    details you provided to identify relevant opportunities.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setForm(empty);
                      setSubmitted(false);
                      setSubmissionError("");
                    }}
                    className="mt-7 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white hover:bg-blue-600"
                  >
                    Submit another request
                  </button>

                </div>

              ) : (

                <form
                  onSubmit={submit}
                  className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5 shadow-xl sm:p-8"
                >

                  <div className="grid gap-5 md:grid-cols-2">

                    {/* CAREER LEVEL */}
                    <div className="md:col-span-2">

                      <Field
                        label="Career level"
                        required
                      >

                        <select
                          required
                          value={form.careerLevel}
                          onChange={(e) =>
                            set(
                              "careerLevel",
                              e.target.value
                            )
                          }
                        >

                          <option value="">
                            Choose your career level
                          </option>

                          {packages.map((pkg) => (

                            <option
                              key={pkg.key}
                              value={pkg.key}
                            >
                              {pkg.name} — ${pkg.price}
                            </option>

                          ))}

                        </select>

                      </Field>

                    </div>


                    {/* NAME */}
                    <Field
                      label="Full name"
                      required
                    >

                      <input
                        required
                        value={form.name}
                        onChange={(e) =>
                          set("name", e.target.value)
                        }
                        placeholder="Your full name"
                      />

                    </Field>


                    {/* EMAIL */}
                    <Field
                      label="Email address"
                      required
                    >

                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          set("email", e.target.value)
                        }
                        placeholder="you@example.com"
                      />

                    </Field>


                    {/* ROLE */}
                    <Field
                      label="Target job / role"
                      required
                    >

                      <input
                        required
                        value={form.role}
                        onChange={(e) =>
                          set("role", e.target.value)
                        }
                        placeholder="e.g. Product Manager"
                      />

                    </Field>


                    {/* INDUSTRY */}
                    <Field label="Industry">

                      <input
                        value={form.industry}
                        onChange={(e) =>
                          set(
                            "industry",
                            e.target.value
                          )
                        }
                        placeholder="e.g. Technology, Finance"
                      />

                    </Field>


                    {/* LOCATION */}
                    <Field
                      label="Preferred location"
                      required
                    >

                      <input
                        required
                        value={form.location}
                        onChange={(e) =>
                          set(
                            "location",
                            e.target.value
                          )
                        }
                        placeholder="e.g. UK, Canada, Remote"
                      />

                    </Field>


                    {/* WORK PREFERENCE */}
                    <Field
                      label="Work preference"
                      required
                    >

                      <select
                        required
                        value={form.workMode}
                        onChange={(e) =>
                          set(
                            "workMode",
                            e.target.value
                          )
                        }
                      >

                        <option value="">
                          Select
                        </option>

                        <option>
                          Remote
                        </option>

                        <option>
                          Hybrid
                        </option>

                        <option>
                          On-site
                        </option>

                        <option>
                          Open to any
                        </option>

                      </select>

                    </Field>


                    {/* EXPERIENCE */}
                    <Field
                      label="Experience level"
                      required
                    >

                      <select
                        required
                        value={form.experience}
                        onChange={(e) =>
                          set(
                            "experience",
                            e.target.value
                          )
                        }
                      >

                        <option value="">
                          Select
                        </option>

                        <option>
                          Entry level
                        </option>

                        <option>
                          Junior
                        </option>

                        <option>
                          Mid-level
                        </option>

                        <option>
                          Senior
                        </option>

                        <option>
                          Manager
                        </option>

                        <option>
                          Executive
                        </option>

                      </select>

                    </Field>


                    {/* CV UPLOAD */}
                    <Field label="CV (optional)">

                      <label className="flex h-11 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-3 text-sm font-semibold text-slate-500 hover:border-blue-400 hover:text-blue-600">

                        <Upload size={17} />

                        <span className="truncate">
                          {form.cv
                            ? form.cv.name
                            : "Upload PDF, DOC or DOCX"}
                        </span>

                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={(e) => {
                            const file =
                              e.target.files?.[0] ||
                              null;

                            if (file) {
                              const maxSize =
                                5 * 1024 * 1024;

                              if (
                                file.size >
                                maxSize
                              ) {
                                setSubmissionError(
                                  "Please upload a CV smaller than 5MB."
                                );

                                e.target.value = "";
                                set(
                                  "cv",
                                  null
                                );
                                return;
                              }
                            }

                            setSubmissionError("");
                            set("cv", file);
                          }}
                        />

                      </label>

                      <p className="mt-2 text-xs text-slate-400">
                        Maximum file size: 5MB.
                      </p>

                    </Field>


                    {/* ADDITIONAL MESSAGE */}
                    <div className="md:col-span-2">

                      <Field label="Anything else we should know?">

                        <textarea
                          rows="4"
                          value={form.message}
                          onChange={(e) =>
                            set(
                              "message",
                              e.target.value
                            )
                          }
                          placeholder="Tell us about your goals, industries you're considering, visa/location preferences, salary expectations, etc."
                          className="!h-auto !py-3 resize-none"
                        />

                      </Field>

                    </div>

                  </div>


                  {/* ERROR */}
                  {submissionError && (

                    <p
                      role="alert"
                      className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-900"
                    >
                      {submissionError}
                    </p>

                  )}


                  {/* SUBMIT */}
                  <div className="mt-7 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex max-w-xl gap-2 text-xs leading-5 text-slate-500">

                      <ShieldCheck
                        size={17}
                        className="mt-0.5 shrink-0 text-blue-600"
                      />

                      Your information is used to understand your request and
                      provide relevant job-search support.

                    </div>


                    <button
                      type="submit"
                      disabled={busy}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-60"
                    >

                      {busy
                        ? "Submitting..."
                        : form.careerLevel
                          ? `Get started — $${
                              packages.find(
                                (pkg) =>
                                  pkg.key ===
                                  form.careerLevel
                              )?.price
                            }`
                          : "Find my jobs"}

                      {!busy && (
                        <ArrowRight size={17} />
                      )}

                    </button>

                  </div>

                </form>

              )}

            </div>

          </div>

        </section>


        {/* FINAL CTA */}
        <section className="border-t border-slate-200 bg-slate-50">

          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-14 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">

            <div>

              <h2 className="text-xl font-black">
                Ready to search smarter?
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Start with your requirements. We'll focus on the opportunities
                that fit.
              </p>

            </div>

            <a
              href="#match"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-black text-white hover:bg-blue-600"
            >
              Find my jobs
              <ArrowRight size={17} />
            </a>

          </div>

        </section>

      </main>


      {/* FOOTER */}
      <footer className="bg-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">

          <div className="flex items-center gap-2 font-black">

            <span className="grid size-8 place-items-center rounded-lg bg-blue-600 text-white">
              <BriefcaseBusiness size={16} />
            </span>

            JobMatch

          </div>

          <p className="text-xs text-slate-500">
            Find the right jobs. Apply with confidence. © 2026 JobMatch.
          </p>

        </div>

      </footer>

    </div>
  );
}


createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
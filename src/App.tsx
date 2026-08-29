import { useEffect, useState, type FormEvent } from "react";

import {
  Activity,
  AlertCircle,
  ArrowRight,
  
  BarChart3,
  Bell,
  Check,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Menu,
  Microscope,
  Plus,
  PersonStanding,
  Printer,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  X,

} from "lucide-react";
import "./App.css";
import type {
  AssessmentRecord,
  ExtractResponse,
  Medication,
  PredictionResponse,
} from "./types/api";
import {
  extractRecommendations,
  predictDisease,
  submitFeedback,
  receiveDiagnosis,
} from "./services/api";
import { createClinicAccount, getAssessments, getCurrentUser, getSymptoms, saveAssessment, signIn, signOut, type SymptomCatalogItem } from "./services/supabase";
import frontBodyImage from "./assets/front-m.webp";
import backBodyImage from "./assets/back-m.webp";

type BodyView = "front" | "back";
type BodyRegion = { name: string; x: number; y: number; width: number; height: number; shape?: "ellipse"; path?: string };
const bodyRegions: Record<BodyView, BodyRegion[]> = {
  front: [
    { name: "Head", x: 41, y: 1, width: 18, height: 12, shape: "ellipse" }, { name: "Face", x: 43, y: 5, width: 14, height: 8, shape: "ellipse" },
    { name: "Eyes", x: 45, y: 10, width: 10, height: 2, path: "M44.5 10.1 C47 9.5 53 9.5 55.5 10.1 L55 11.8 C52.5 12.4 47.5 12.4 45 11.8 Z" }, { name: "Ears", x: 40, y: 8, width: 20, height: 3 }, { name: "Nose", x: 48, y: 8, width: 4, height: 3 }, { name: "Mouth / Throat", x: 45, y: 10, width: 10, height: 6 },
    { name: "Neck", x: 44, y: 13, width: 12, height: 6 }, { name: "Chest", x: 31, y: 18, width: 38, height: 12, shape: "ellipse" }, { name: "Abdomen", x: 38, y: 30, width: 24, height: 13, path: "M38 30 C44 32 56 32 62 30 L61 40 C57 44 43 44 39 40 Z" }, { name: "Pelvis", x: 38, y: 42, width: 24, height: 8, path: "M39 41 C45 43 55 43 61 41 L60 47 C56 51 44 51 40 47 Z" },
    { name: "Left Arm", x: 8, y: 22, width: 29, height: 22 }, { name: "Right Arm", x: 63, y: 22, width: 29, height: 22 }, { name: "Left Hand", x: 0, y: 40, width: 17, height: 13 }, { name: "Right Hand", x: 83, y: 40, width: 17, height: 13 },
    { name: "Left Leg", x: 30, y: 49, width: 18, height: 37 }, { name: "Right Leg", x: 52, y: 49, width: 18, height: 37 }, { name: "Left Foot", x: 25, y: 84, width: 19, height: 14 }, { name: "Right Foot", x: 56, y: 84, width: 19, height: 14 }, { name: "Skin", x: 18, y: 1, width: 64, height: 97 },
  ],
  back: [
    { name: "Head", x: 40, y: 1, width: 20, height: 10, shape: "ellipse" }, { name: "Neck", x: 43, y: 10, width: 14, height: 6 }, { name: "Upper Back", x: 30, y: 15, width: 40, height: 14 }, { name: "Middle Back", x: 34, y: 29, width: 32, height: 14 }, { name: "Lower Back", x: 35, y: 43, width: 30, height: 10 },
    { name: "Left Shoulder", x: 23, y: 16, width: 17, height: 9 }, { name: "Right Shoulder", x: 60, y: 16, width: 17, height: 9 }, { name: "Left Arm", x: 5, y: 23, width: 28, height: 22 }, { name: "Right Arm", x: 67, y: 23, width: 28, height: 22 }, { name: "Left Hand", x: 0, y: 41, width: 16, height: 11 }, { name: "Right Hand", x: 84, y: 41, width: 16, height: 11 },
    { name: "Pelvis", x: 35, y: 51, width: 30, height: 9 }, { name: "Left Leg", x: 27, y: 59, width: 21, height: 29 }, { name: "Right Leg", x: 52, y: 59, width: 21, height: 29 }, { name: "Left Foot", x: 23, y: 86, width: 18, height: 13 }, { name: "Right Foot", x: 59, y: 86, width: 18, height: 13 }, { name: "Skin", x: 18, y: 1, width: 64, height: 97 },
  ],
};
const emptyMedication = (): Medication => ({
  drug: "",
  strength: "",
  dosage: "",
  duration: "",
});
type View = "assessment" | "history" | "feedback" | "settings";
type DoctorProfile = { name: string; clinic: string; email?: string };

function App() {
  const [view, setView] = useState<View>("assessment");
  const [showLanding, setShowLanding] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile>({ name: "Guest workspace", clinic: "Clinica", email: "" });
  const [history, setHistory] = useState<AssessmentRecord[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([
    "Fever",
    "Headache",
    "Body pain",
  ]);
  const [patient, setPatient] = useState({ name: "", patientId: "", age: "" });
  const [symptomCatalog, setSymptomCatalog] = useState<SymptomCatalogItem[]>([]);
  const [bodyView, setBodyView] = useState<BodyView>("front");
  const [activeBodyRegion, setActiveBodyRegion] = useState<string | null>(null);


  const [showAllSymptoms, setShowAllSymptoms] = useState(false);
  const [symptomSearch, setSymptomSearch] = useState("");
  const [predictions, setPredictions] = useState<PredictionResponse | null>(
    null,
  );
  const [recommendations, setRecommendations] =
    useState<ExtractResponse | null>(null);
  const [diagnosis, setDiagnosis] = useState<string[]>([]);
  const [customDiagnosis, setCustomDiagnosis] = useState("");
  const [finalMeds, setFinalMeds] = useState<Medication[]>([]);
  const [finalPathology, setFinalPathology] = useState<string[]>([]);
  const [finalRadiology, setFinalRadiology] = useState<string[]>([]);
  const [testInput, setTestInput] = useState("");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [apiLog, setApiLog] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const topPrediction = predictions
    ? Object.entries(predictions.predictions).sort(([, a], [, b]) => b - a)[0]
    : null;

  const profileFromUser = (user: { user_metadata?: { doctor_name?: string; clinic_name?: string }; email?: string | null }): DoctorProfile => ({
    name: user.user_metadata?.doctor_name || "Signed-in doctor",
    clinic: user.user_metadata?.clinic_name || "Clinica",
    email: user.email || "",
  });

  useEffect(() => {
    getSymptoms()
      .then(setSymptomCatalog)
      .catch((error) => {
        if (import.meta.env.DEV) console.error(error);
      });
  }, []);
  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        if (user) {
          setDoctorProfile(profileFromUser(user));
          setSignedIn(true);
          setShowLanding(false);
        }
      })
      .finally(() => setAuthReady(true));
  }, []);
  useEffect(() => {
    if (view === "history" || view === "feedback") getAssessments(doctorProfile.clinic).then(setHistory).catch((error) => { if (import.meta.env.DEV) console.error(error); });
  }, [view, doctorProfile.clinic]);

  const runPrediction = async () => {
    if (!patient.name.trim())
      return setNotice("Add the patient's name before starting the assessment.");
    if (!symptoms.length)
      return setNotice("Add at least one symptom before analyzing.");
    setBusy("predict");
    setNotice("");
    try {
      const response = await predictDisease(symptoms);
      setPredictions(response);
      setApiLog(JSON.stringify(response, null, 2));
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Unable to connect to the Disease Prediction API.",
      );
    } finally {
      setBusy("");
    }
  };
  const confirmDiagnosis = async () => {
    const selected = [
      ...diagnosis,
      ...(customDiagnosis.trim() ? [customDiagnosis.trim()] : []),
    ];
    if (!selected.length)
      return setNotice("Select or enter the doctor's final diagnosis.");
    setDiagnosis(selected);
    setCustomDiagnosis("");
    setBusy("confirm");
    setNotice("");
    try {
      await receiveDiagnosis(symptoms, selected);
      setNotice(
        "Diagnosis recorded successfully. You can now generate recommendations.",
      );
    } catch (error) {
      setNotice(
        `${error instanceof Error ? error.message : "Unable to record the diagnosis."} You can still retry or continue to recommendations.`,
      );
    } finally {
      setBusy("");
    }
  };
  const generateRecommendations = async () => {
    const disease = diagnosis[0] || topPrediction?.[0];
    if (!disease)
      return setNotice(
        "Confirm a diagnosis before generating recommendations.",
      );
    setBusy("extract");
    setNotice("");
    try {
      const response = await extractRecommendations(disease);
      setRecommendations(response);
      setFinalMeds(response.medications);
      setFinalPathology(response.pathology_tests);
      setFinalRadiology(response.radiology_tests);
      setApiLog(JSON.stringify(response, null, 2));
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Unable to generate clinical recommendations.",
      );
    } finally {
      setBusy("");
    }
  };
  const sendFeedback = async () => {
    if (!recommendations) return;
    setBusy("feedback");
    setNotice("");
    try {
      await submitFeedback({
        disease_name: recommendations.disease_name,
        suggested: {
          suggested_medications: recommendations.medications,
          suggested_pathology_test: recommendations.pathology_tests,
          suggested_radiology_test: recommendations.radiology_tests,
        },
        final: {
          medications: finalMeds,
          pathology_tests: finalPathology,
          radiology_tests: finalRadiology,
        },
      });
      await saveAssessment({
        clinicName: doctorProfile.clinic,
        patient,
        symptoms,
        diagnosis: diagnosis.length
          ? diagnosis
          : [recommendations.disease_name],
        topPrediction: topPrediction?.[0] || recommendations.disease_name,
        feedbackSubmitted: true,
        suggestedRecommendations: { medications: recommendations.medications, pathology_tests: recommendations.pathology_tests, radiology_tests: recommendations.radiology_tests },
        finalRecommendations: { medications: finalMeds, pathology_tests: finalPathology, radiology_tests: finalRadiology },
      });
      setNotice("Feedback submitted successfully.");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Unable to submit feedback.",
      );
    } finally {
      setBusy("");
    }
  };
  const toggleSymptom = (name: string) =>
    setSymptoms((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );
  // Keep the original search/catalog available independently of the body map.
  const filteredSymptoms = symptomCatalog.filter((item) =>
    item.name.toLowerCase().includes(symptomSearch.toLowerCase()),
  );
  const regionSymptoms = activeBodyRegion
    ? symptomCatalog.filter((item) => item.body_region === activeBodyRegion)
    : [];
  const visibleSymptoms =
    symptomSearch.trim() || showAllSymptoms
      ? filteredSymptoms
      : filteredSymptoms.slice(0, 10);
  const selectView = (nextView: View) => { setView(nextView); setMobileMenuOpen(false); };
  const logout = async () => {
    setLogoutBusy(true); setNotice("");
    try {
      await signOut(); setMobileMenuOpen(false); setProfileMenuOpen(false); setHistory([]);
      setDoctorProfile({ name: "Guest workspace", clinic: "Clinica", email: "" }); setSignedIn(false); setShowLanding(true);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to sign out. Please try again."); }
    finally { setLogoutBusy(false); }
  };

  if (!authReady) return <div className="app-loading" aria-live="polite">Loading Clinica…</div>;
  if (showLanding) return <LandingPage signedIn={signedIn} onStart={(profile) => { if (profile) { setDoctorProfile(profile); setSignedIn(true); } setShowLanding(false); }} />;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Activity size={20} />
          </div>
          <div>
            <strong>Clinica</strong>
            <span>AI assistant</span>
          </div>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          {(
            [
              ["assessment", LayoutDashboard, "Dashboard"],
              ["history", Clock3, "Prediction History"],
              ["feedback", ClipboardCheck, "Feedback"],
              ["settings", Settings, "Settings"],
            ] as const
          ).map(([id, Icon, label]) => (
            <button
              key={id}
              className={view === id ? "nav-item active" : "nav-item"}
              onClick={() => selectView(id)}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="help-icon">
            <Bell size={16} />
          </div>
          <div>
            <strong>System monitored</strong>
            <span>Last checked just now</span>
          </div>
        </div>
      </aside>
      {mobileMenuOpen && <button className="mobile-menu-backdrop" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={mobileMenuOpen ? "mobile-drawer open" : "mobile-drawer"} aria-hidden={!mobileMenuOpen}>
        <div className="mobile-drawer-header"><strong>Clinica</strong><button className="drawer-close" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu"><X size={20} /></button></div>
        <nav>{([['assessment', LayoutDashboard, 'Dashboard'], ['history', Clock3, 'Prediction History'], ['feedback', ClipboardCheck, 'Feedback'], ['settings', Settings, 'Settings']] as const).map(([id, Icon, label]) => <button key={id} className={view === id ? "nav-item active" : "nav-item"} onClick={() => selectView(id)}><Icon size={17} />{label}</button>)}</nav>
        <button className="logout-button" onClick={logout} disabled={logoutBusy}><LogOut size={17} />{logoutBusy ? "Signing out..." : "Log out"}</button>
      </aside>
      <main className="main">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Open menu" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(true)}>
            <Menu size={20} />
          </button>
          <button className="workspace-header-brand workspace-home-button" onClick={() => setShowLanding(true)} aria-label="Go to Clinica landing page">
            <div className="landing-mark"><Stethoscope size={17} /></div>
            <strong>Clinica</strong>
          </button>
          <button className="mobile-workspace-brand workspace-home-button" onClick={() => setShowLanding(true)} aria-label="Go to Clinica landing page">
            <div className="landing-mark"><Stethoscope size={17} /></div>
            <strong>Clinica</strong>
          </button>
          <div className="crumb">
            <span>Workspace</span>
            <ArrowRight size={14} />
            <strong>
              {view === "assessment"
                ? "New assessment"
                : view[0].toUpperCase() + view.slice(1)}
            </strong>
          </div>
          <div className="top-actions">
            <button className="icon-button" aria-label="Notifications">
              <Bell size={18} />
              <i />
            </button>
            <div className="profile-menu">
            <button className="profile" onClick={() => setProfileMenuOpen((open) => !open)} aria-haspopup="menu" aria-expanded={profileMenuOpen}>
              <div className="avatar">{doctorProfile.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div>
              <div>
                <strong>{doctorProfile.name}</strong>
                <span>{doctorProfile.clinic}{doctorProfile.email ? ` · ${doctorProfile.email}` : " · Guest access"}</span>
              </div>
              <ChevronDown size={15} />
            </button>
            {profileMenuOpen && <div className="profile-dropdown" role="menu"><div className="profile-dropdown-details"><strong>{doctorProfile.name}</strong><span>{doctorProfile.clinic}</span><span>{doctorProfile.email || "Guest access"}</span></div><button className="logout-button" onClick={logout} disabled={logoutBusy} role="menuitem"><LogOut size={17} />{logoutBusy ? "Signing out..." : "Log out"}</button></div>}
            </div>
          </div>
        </header>
        {view === "assessment" ? (
          <div className="content">
            <section className="page-heading">
              <div>
                <p className="eyebrow">CLINICAL WORKSPACE / 01</p>
                <h1>New patient assessment</h1>
                <p className="subheading">
                  AI-assisted clinical decision support for a more informed
                  diagnosis.
                </p>
              </div>
              <div className="secure">
                <ShieldCheck size={17} /> Secure clinical workspace
              </div>
            </section>
            {notice && (
              <div className="notice">
                <AlertCircle size={17} />
                {notice}
                <button onClick={() => setNotice("")} aria-label="Dismiss">
                  <X size={15} />
                </button>
              </div>
            )}
            <section className="panel patient-panel">
              <div className="panel-heading">
                <div>
                  <span className="section-number teal">00</span>
                  <h2>Add patient</h2>
                </div>
                <span className="required">Patient details</span>
              </div>
              <p className="muted">Create the patient context before recording symptoms.</p>
              <div className="patient-fields">
                <label>Patient name *<input value={patient.name} onChange={(event) => setPatient({ ...patient, name: event.target.value })} placeholder="e.g. Ananya Patel" /></label>
                <label>Patient ID<input value={patient.patientId} onChange={(event) => setPatient({ ...patient, patientId: event.target.value })} placeholder="e.g. PT-10482" /></label>
                <label>Age<input type="number" min="0" max="130" value={patient.age} onChange={(event) => setPatient({ ...patient, age: event.target.value })} placeholder="Years" /></label>
              </div>
            </section>
            <div className="stepper">
              <div className="step active">
                <span>01</span>
                <div>
                  <strong>Patient symptoms</strong>
                  <small>Describe the presentation</small>
                </div>
              </div>
              <div className="step-line" />
              <div className={predictions ? "step complete" : "step"}>
                <span>{predictions ? <Check size={14} /> : "02"}</span>
                <div>
                  <strong>AI prediction</strong>
                  <small>Review likely conditions</small>
                </div>
              </div>
              <div className="step-line" />
              <div className={recommendations ? "step complete" : "step"}>
                <span>{recommendations ? <Check size={14} /> : "03"}</span>
                <div>
                  <strong>Clinical review</strong>
                  <small>Confirm and refine</small>
                </div>
              </div>
            </div>
            <div className="assessment-grid">
              <section className="panel symptoms-panel">
                <div className="panel-heading">
                  <div>
                    <span className="section-number">01</span>
                    <h2>Patient symptoms</h2>
                  </div>
                  <span className="required">Required</span>
                </div>
                <p className="muted">Use the symptom catalog below, or expand the body map to select by location.</p>
                <details className="body-map-disclosure">
                  <summary><span><PersonStanding size={17} /> Body map</span><ChevronDown size={17} /></summary>
                  <div className="body-map-content">
                    <div className="body-view-toggle" role="tablist" aria-label="Body view">
                      {(["front", "back"] as const).map((item) => <button key={item} type="button" role="tab" aria-selected={bodyView === item} className={bodyView === item ? "active" : ""} onClick={() => { setBodyView(item); setActiveBodyRegion(null); }}><PersonStanding size={13} />{item}</button>)}
                    </div>
                    <div className="body-map">
                      <div className="body-map-canvas">
                        <img src={bodyView === "front" ? frontBodyImage : backBodyImage} alt={`${bodyView} body anatomy map`} />
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Select a body region">
                          {[...bodyRegions[bodyView]].sort((a, b) => Number(b.name === "Skin") - Number(a.name === "Skin")).map((region) => region.path ? <path key={region.name} d={region.path} className={activeBodyRegion === region.name ? "body-hotspot selected" : "body-hotspot"} onClick={() => setActiveBodyRegion(region.name)}><title>{region.name}</title></path> : <rect key={region.name} x={region.x} y={region.y} width={region.width} height={region.height} rx={region.shape === "ellipse" ? 8 : 3} className={activeBodyRegion === region.name ? "body-hotspot selected" : "body-hotspot"} onClick={() => setActiveBodyRegion(region.name)}><title>{region.name}</title></rect>)}
                        </svg>
                      </div>
                      
                    </div>
                    <div className="body-region-status" aria-live="polite">{activeBodyRegion ? <><span>Selected region</span><strong>{activeBodyRegion}</strong></> : "Select a region on the body map to view its symptoms."}</div>
                    {activeBodyRegion && <div className="region-symptom-picker"><div className="common-label">{activeBodyRegion.toUpperCase()} SYMPTOMS</div><div className="suggestions">{regionSymptoms.map((symptom) => <button key={symptom.id} className={symptoms.includes(symptom.name) ? "suggestion selected" : "suggestion"} onClick={() => toggleSymptom(symptom.name)}>{symptoms.includes(symptom.name) ? <Check size={14} /> : <Plus size={14} />}{symptom.name}</button>)}</div>{!regionSymptoms.length && <p className="no-region-symptoms">No active symptoms are configured for {activeBodyRegion}.</p>}</div>}
                  </div>
                </details>
                <div className="search-field">
                  <Search size={17} />
                  <input
                    value={symptomSearch}
                    onChange={(event) => setSymptomSearch(event.target.value)}
                    placeholder="Search or type a symptom..."
                  />
                  <kbd>⌘ K</kbd>
                </div>
                <div className="chips">
                  {symptoms.map((symptom) => (
                    <span className="chip" key={symptom}>
                      {symptom}
                      <button
                        onClick={() => toggleSymptom(symptom)}
                        aria-label={`Remove ${symptom}`}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="common-label">COMMON SYMPTOMS</div>
                <div className="suggestions">
                  {visibleSymptoms.map((symptom) => (
                    <button
                      key={symptom.id}
                      className={
                        symptoms.includes(symptom.name)
                          ? "suggestion selected"
                          : "suggestion"
                      }
                      onClick={() => toggleSymptom(symptom.name)}
                    >
                      {symptoms.includes(symptom.name) ? (
                        <Check size={14} />
                      ) : (
                        <Plus size={14} />
                      )}
                      {symptom.name}
                    </button>
                  ))}
                </div>
                {!symptomSearch.trim() && filteredSymptoms.length > 10 && (
                  <button
                    className="show-more"
                    onClick={() => setShowAllSymptoms((current) => !current)}
                  >
                    {showAllSymptoms
                      ? "Show fewer"
                      : `Show more (${filteredSymptoms.length - 10})`}
                    <ChevronDown
                      size={14}
                      className={showAllSymptoms ? "flip" : ""}
                    />
                  </button>
                )}
                <button
                  className="primary-button"
                  onClick={runPrediction}
                  disabled={busy === "predict"}
                >
                  {busy === "predict" ? (
                    <>
                      <span className="spinner" />
                      Analyzing symptoms...
                    </>
                  ) : (
                    <>
                      <Activity size={17} />
                      Predict disease <ArrowRight size={16} />
                    </>
                  )}
                </button>
                <p className="disclaimer">
                  <ShieldCheck size={15} /> AI prediction is decision support
                  only. Final diagnosis must be confirmed by a qualified
                  clinician.
                </p>
              </section>
              <section className="panel prediction-panel">
                <div className="panel-heading">
                  <div>
                    <span className="section-number teal">02</span>
                    <h2>Prediction insight</h2>
                  </div>
                  <span className="ai-badge">
                    <Activity size={13} /> AI MODEL
                  </span>
                </div>
                {topPrediction ? (
                  <>
                    <div className="top-prediction">
                      <div>
                        <span className="tiny-label">TOP PREDICTION</span>
                        <h3>{topPrediction[0]}</h3>
                        <p>
                          Highest model confidence among analyzed conditions
                        </p>
                      </div>
                      <div className="confidence">
                        <strong>
                          {topPrediction[1].toFixed(2)}
                          <small>%</small>
                        </strong>
                        <span>confidence</span>
                      </div>
                    </div>
                    <div className="prediction-list">
                      {Object.entries(predictions?.predictions || {})
                        .sort(([, a], [, b]) => b - a)
                        .map(([disease, score]) => (
                          <div className="prediction-row" key={disease}>
                            <div className="row-label">
                              <span>{disease}</span>
                              <strong>{score.toFixed(2)}%</strong>
                            </div>
                            <div className="bar">
                              <span
                                style={{ width: `${Math.max(score, 2)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </>
                ) : (
                  <div className="empty-prediction">
                    <BarChart3 size={32} />
                    <strong>Awaiting symptom analysis</strong>
                    <span>
                      Add symptoms and run a prediction to see model insights
                      here.
                    </span>
                  </div>
                )}
              </section>
            </div>
            <section className="panel confirmation-panel">
              <div className="panel-heading">
                <div>
                  <span className="section-number coral">03</span>
                  <h2>Doctor confirmation</h2>
                </div>
                <span className="clinician-only">
                  <Stethoscope size={14} /> Clinician action
                </span>
              </div>
              <div className="confirmation-grid">
                <div className="ai-callout">
                  <span className="tiny-label">AI PREDICTION</span>
                  <strong>
                    {topPrediction
                      ? `${topPrediction[0]} — ${topPrediction[1].toFixed(2)}%`
                      : "Complete prediction above"}
                  </strong>
                  <span>Use clinical judgment to confirm or adjust.</span>
                </div>
                <div className="diagnosis-input">
                  <label>Doctor's final diagnosis</label>
                  <div className="diagnosis-search">
                    <Search size={16} />
                    <input
                      placeholder="Search or enter a diagnosis..."
                      value={customDiagnosis}
                      onChange={(event) =>
                        setCustomDiagnosis(event.target.value)
                      }
                    />
                  </div>
                  <div className="selected-diagnoses">
                    {(predictions
                      ? Object.keys(predictions.predictions)
                      : ["Dengue", "Malaria", "Typhoid"]
                    )
                      .slice(0, 3)
                      .map((disease) => (
                        <button
                          key={disease}
                          className={
                            diagnosis.includes(disease)
                              ? "diagnosis-option selected"
                              : "diagnosis-option"
                          }
                          onClick={() =>
                            setDiagnosis(
                              diagnosis.includes(disease)
                                ? diagnosis.filter((item) => item !== disease)
                                : [...diagnosis, disease],
                            )
                          }
                        >
                          {diagnosis.includes(disease) ? (
                            <Check size={14} />
                          ) : (
                            <Plus size={14} />
                          )}
                          {disease}
                        </button>
                      ))}
                  </div>
                </div>
                <button
                  className="outline-button"
                  onClick={confirmDiagnosis}
                  disabled={busy === "confirm"}
                >
                  {busy === "confirm" ? "Recording..." : "Confirm diagnosis"}{" "}
                  <ArrowRight size={16} />
                </button>
              </div>
            </section>
            <section className="recommendation-bar">
              <div>
                <div className="rec-icon">
                  <Microscope size={19} />
                </div>
                <div>
                  <strong>Ready for clinical recommendations?</strong>
                  <span>
                    Generate suggested medications and tests after confirming
                    the diagnosis.
                  </span>
                </div>
              </div>
              <button
                className="secondary-button"
                onClick={generateRecommendations}
                disabled={busy === "extract"}
              >
                {busy === "extract"
                  ? "Generating..."
                  : "Generate recommendations"}{" "}
                <ArrowRight size={16} />
              </button>
            </section>
            {recommendations && (
              <section className="panel review-panel">
                <div className="panel-heading">
                  <div>
                    <span className="section-number purple">04</span>
                    <h2>Review AI recommendations</h2>
                  </div>
                  <span className="review-label">
                    Clinician review required
                  </span>
                </div>
                <div className="review-columns">
                  <div>
                    <h3>AI suggested</h3>
                    <RecommendationList
                      meds={recommendations.medications}
                      pathology={recommendations.pathology_tests}
                      radiology={recommendations.radiology_tests}
                    />
                  </div>
                  <div>
                    <h3>Final doctor recommendation</h3>
                    <div className="editable-list">
                      {finalMeds.map((med, index) => (
                        <div className="med-edit" key={`${med.drug}-${index}`}>
                          <input
                            placeholder="Drug"
                            value={med.drug}
                            onChange={(event) =>
                              setFinalMeds(
                                finalMeds.map((item, i) =>
                                  i === index
                                    ? { ...item, drug: event.target.value }
                                    : item,
                                ),
                              )
                            }
                          />
                          <input
                            placeholder="Strength"
                            value={med.strength}
                            onChange={(event) =>
                              setFinalMeds(
                                finalMeds.map((item, i) =>
                                  i === index
                                    ? { ...item, strength: event.target.value }
                                    : item,
                                ),
                              )
                            }
                          />
                          <input
                            placeholder="Dosage"
                            value={med.dosage}
                            onChange={(event) =>
                              setFinalMeds(
                                finalMeds.map((item, i) =>
                                  i === index
                                    ? { ...item, dosage: event.target.value }
                                    : item,
                                ),
                              )
                            }
                          />
                          <input
                            placeholder="Duration"
                            value={med.duration}
                            onChange={(event) =>
                              setFinalMeds(
                                finalMeds.map((item, i) =>
                                  i === index
                                    ? { ...item, duration: event.target.value }
                                    : item,
                                ),
                              )
                            }
                          />
                          <button
                            onClick={() =>
                              setFinalMeds(
                                finalMeds.filter((_, i) => i !== index),
                              )
                            }
                            aria-label="Remove medication"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      ))}
                      <button
                        className="add-row"
                        onClick={() =>
                          setFinalMeds([...finalMeds, emptyMedication()])
                        }
                      >
                        <Plus size={15} /> Add medication
                      </button>
                      <TestEditor
                        label="Pathology tests"
                        items={finalPathology}
                        setItems={setFinalPathology}
                        input={testInput}
                        setInput={setTestInput}
                      />
                      <TestEditor
                        label="Radiology tests"
                        items={finalRadiology}
                        setItems={setFinalRadiology}
                        input={testInput}
                        setInput={setTestInput}
                      />
                    </div>
                  </div>
                </div>
                <button
                  className="primary-button feedback-button"
                  onClick={sendFeedback}
                  disabled={busy === "feedback"}
                >
                  {busy === "feedback" ? "Submitting..." : "Submit feedback"}{" "}
                  <ArrowRight size={16} />
                </button>
                <details className="debug-panel">
                  <summary>API Request / Response</summary>
                  <pre>{apiLog || "No request recorded yet."}</pre>
                </details>
              </section>
            )}
            {recommendations && (
              <section className="summary">
                <div>
                  <span className="tiny-label">ASSESSMENT COMPLETE</span>
                  <h2>Assessment summary</h2>
                </div>
                <div className="summary-items">
                  <span>
                    <strong>Symptoms</strong>
                    {symptoms.length} recorded
                  </span>
                  <span>
                    <strong>AI top prediction</strong>
                    {topPrediction?.[0] || recommendations.disease_name}
                  </span>
                  <span>
                    <strong>Doctor's diagnosis</strong>
                    {diagnosis.join(", ") || recommendations.disease_name}
                  </span>
                  <span>
                    <strong>Recommendations</strong>
                    {finalMeds.length +
                      finalPathology.length +
                      finalRadiology.length}{" "}
                    items reviewed
                  </span>
                </div>
                <button
                  className="outline-button"
                  onClick={() => {
                    setPredictions(null);
                    setRecommendations(null);
                    setDiagnosis([]);
                    setSymptoms([]);
                    setNotice("");
                  }}
                >
                  Start new assessment <Plus size={16} />
                </button>
              </section>
            )}
          </div>
        ) : (
          <WorkspaceView view={view} history={history} profile={doctorProfile} onReturn={() => setView("assessment")} />
        )}
      </main>
    </div>
  );
}

function RecommendationList({
  meds,
  pathology,
  radiology,
}: {
  meds: Medication[];
  pathology: string[];
  radiology: string[];
}) {
  return (
    <div className="recommendation-list">
      <strong>Medications</strong>
      {meds.map((med) => (
        <div className="recommendation-item" key={med.drug}>
          <span className="med-icon">
            <FlaskConical size={15} />
          </span>
          <span>
            <b>{med.drug}</b>
            <small>
              {med.strength} · {med.dosage} · {med.duration}
            </small>
          </span>
        </div>
      ))}
      <strong>Pathology tests</strong>
      {pathology.map((item) => (
        <div className="test-item" key={item}>
          <Check size={14} />
          {item}
        </div>
      ))}
      <strong>Radiology tests</strong>
      {radiology.map((item) => (
        <div className="test-item" key={item}>
          <Check size={14} />
          {item}
        </div>
      ))}
    </div>
  );
}
function TestEditor({
  label,
  items,
  setItems,
  input,
  setInput,
}: {
  label: string;
  items: string[];
  setItems: (items: string[]) => void;
  input: string;
  setInput: (value: string) => void;
}) {
  return (
    <div className="test-editor">
      <label>{label}</label>
      <div className="editable-tests">
        {items.map((item) => (
          <span key={item}>
            {item}
            <button
              onClick={() => setItems(items.filter((test) => test !== item))}
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="add-test">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={`Add ${label.toLowerCase()}`}
          onKeyDown={(event) => {
            if (event.key === "Enter" && input.trim()) {
              setItems([...items, input.trim()]);
              setInput("");
            }
          }}
        />
        <Plus size={15} />
      </div>
    </div>
  );
}
function LandingPage({ onStart, signedIn }: { onStart: (profile?: DoctorProfile) => void; signedIn: boolean }) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [doctorName, setDoctorName] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [landingMenuOpen, setLandingMenuOpen] = useState(false);
  const openAuth = (mode: "login" | "signup") => { setAuthMode(mode); setLoginError(""); setLandingMenuOpen(false); setLoginOpen(true); };
  const submitLogin = async (event: FormEvent) => { event.preventDefault(); if (authMode === "signup" && (!doctorName.trim() || !clinicName.trim())) return setLoginError("Enter the doctor and clinic name."); if (!email.trim() || !password) return setLoginError("Enter your email and password."); setLoginBusy(true); setLoginError(""); try { if (authMode === "signup") { const result = await createClinicAccount(doctorName.trim(), clinicName.trim(), email.trim(), password); if (result.session) onStart({ name: doctorName.trim(), clinic: clinicName.trim(), email: email.trim() }); else setLoginError("Account created. Check your email to confirm your account, then sign in."); } else { const user = await signIn(email.trim(), password); onStart({ name: user?.user_metadata?.doctor_name || "Signed-in doctor", clinic: user?.user_metadata?.clinic_name || "Clinica", email: user?.email || email.trim() }); } } catch (error) { setLoginError(error instanceof Error ? error.message : `Unable to ${authMode === "signup" ? "create the account" : "sign in"}. Please try again.`); } finally { setLoginBusy(false); } };
  return (
    <div className="landing-page">
      <header className="landing-nav">
        <div className="landing-brand"><div className="landing-mark"><Stethoscope size={19} /></div><strong>Clinica</strong></div>
        <nav className={landingMenuOpen ? "landing-links open" : "landing-links"}><a href="#features" onClick={() => setLandingMenuOpen(false)}>Features</a><a href="#how" onClick={() => setLandingMenuOpen(false)}>How it works</a><a href="#clinics" onClick={() => setLandingMenuOpen(false)}>For clinics</a><div className="landing-mobile-actions">{signedIn ? <button className="landing-cta" onClick={() => onStart()}>Open workspace <ArrowRight size={15} /></button> : <><button className="landing-login" onClick={() => openAuth("login")}>Log in</button><button className="landing-cta" onClick={() => openAuth("signup")}>Get started free <ArrowRight size={15} /></button></>}</div></nav>
        <div className="landing-actions">{signedIn ? <button className="landing-cta" onClick={() => onStart()}>Open workspace <ArrowRight size={15} /></button> : <><button className="landing-login" onClick={() => openAuth("login")}>Log in</button><button className="landing-cta" onClick={() => openAuth("signup")}>Create your clinic <ArrowRight size={15} /></button></>}</div>
        <button className="landing-menu-button" onClick={() => setLandingMenuOpen((open) => !open)} aria-label="Toggle navigation" aria-expanded={landingMenuOpen}>{landingMenuOpen ? <X size={21} /> : <Menu size={21} />}</button>
      </header>
      <main className="landing-hero">
        <div className="landing-badge"><Activity size={14} /> AI-assisted clinical support</div>
        <h1>More clarity for every<br /><em>clinical decision.</em></h1>
        <p>Enter a patient's details and symptoms. Clinica helps you review possible conditions, organize suggested tests and medicines, and record the doctor's final decision.</p>
        <div className="landing-buttons"><button className="landing-cta large" onClick={() => { setAuthMode("signup"); setLoginOpen(true); }}>Create your clinic <ArrowRight size={16} /></button><button className="landing-video" onClick={() => onStart()}><span><PlayIcon /></span> Explore the workspace</button></div>
        <div className="landing-trust"><span><Check size={14} /> Easy patient entry</span><span><Check size={14} /> Doctor stays in control</span><span><Check size={14} /> Secure case records</span></div>
        <div className="landing-preview"><div className="preview-top"><span className="preview-dot" /><span>Clinical workspace</span><span className="preview-status"><i /> System ready</span></div><div className="preview-body"><div><span className="tiny-label">TODAY'S WORKSPACE</span><strong>Patient assessment</strong></div><div className="preview-stats"><span><b>24</b> assessments</span><span><b>98%</b> reviewed</span></div><div className="preview-line" /></div></div>
      </main>
      <section className="landing-section feature-section" id="features"><div className="landing-section-intro"><p className="landing-kicker">ONE WORKSPACE, LESS FRICTION</p><h2>Built around the way clinical teams work.</h2><p>Keep symptoms, model insights, doctor confirmation, and recommendations in one calm, structured workflow.</p></div><div className="landing-feature-grid"><article><div className="feature-icon"><Activity size={18} /></div><h3>Structured assessments</h3><p>Capture patient details and symptoms consistently before prediction begins.</p></article><article><div className="feature-icon"><Microscope size={18} /></div><h3>Reviewable recommendations</h3><p>See suggested medications and tests clearly, then refine them as a clinician.</p></article><article><div className="feature-icon"><ShieldCheck size={18} /></div><h3>Records you can trust</h3><p>Keep the final doctor decision and feedback alongside the original AI insight.</p></article><article><div className="feature-icon"><Search size={18} /></div><h3>Focused clinical review</h3><p>Search symptoms quickly and keep the selected presentation visible throughout the assessment.</p></article><article><div className="feature-icon"><ClipboardCheck size={18} /></div><h3>Clinician-led confirmation</h3><p>Record the final diagnosis separately from the AI prediction to preserve clinical accountability.</p></article><article><div className="feature-icon"><Printer size={18} /></div><h3>Ready-to-share case sheets</h3><p>Generate a clear case record with the assessment, final recommendations, and submitted feedback.</p></article></div></section>
      <section className="landing-section process-section" id="how"><div className="landing-section-intro"><p className="landing-kicker">A CLEAR CLINICAL WORKFLOW</p><h2>From patient visit to a complete case sheet.</h2><p>Clinica keeps the medical record, AI insight, and clinician decision in one reviewable workflow.</p></div><div className="workflow-demo" aria-label="Clinical workflow demonstration"><div className="workflow-demo-top"><span>CLINICA WORKSPACE</span><span className="workflow-demo-status"><i /> Assessment in progress</span></div><div className="workflow-demo-steps"><div className="workflow-demo-card"><span className="workflow-demo-number">01</span><strong>Patient details</strong><small>Ananya Patel · PT-10482</small><div className="workflow-demo-tags"><b>Fever</b><b>Headache</b></div></div><ArrowRight className="workflow-demo-arrow" size={18} /><div className="workflow-demo-card"><span className="workflow-demo-number">02</span><strong>Clinical review</strong><small>Possible condition</small><div className="workflow-demo-result"><Activity size={14} /><b>Dengue fever</b><span>82%</span></div></div><ArrowRight className="workflow-demo-arrow" size={18} /><div className="workflow-demo-card"><span className="workflow-demo-number">03</span><strong>Case sheet</strong><small>Doctor-confirmed plan</small><div className="workflow-demo-check"><Check size={14} /> Recommendations saved</div></div></div></div><div className="process-grid"><div><span>01</span><h3>Capture the clinical picture</h3><p>Add the patient's name, ID, age, and the symptoms observed during the consultation. This creates the context for the assessment.</p><small>Patient details and symptom list</small></div><div><span>02</span><h3>Review AI-supported possibilities</h3><p>Compare predicted conditions and confidence levels with your clinical judgment. AI suggests possibilities; the clinician remains the decision-maker.</p><small>Predictions, differential review, and clinician diagnosis</small></div><div><span>03</span><h3>Confirm, refine, and record</h3><p>Review recommended medicines and tests, make any needed changes, submit feedback, and generate a printable case sheet.</p><small>Final plan, feedback, and documented record</small></div></div></section>
      <section className="landing-section clinics-section" id="clinics"><div><p className="landing-kicker">FOR CLINICS AND CARE TEAMS</p><h2>Designed for thoughtful care at every scale.</h2><p>Give physicians and hospital staff a shared clinical workspace that keeps human judgment at the center.</p></div><button className="landing-cta large" onClick={() => onStart()}>Open the workspace <ArrowRight size={16} /></button></section>
      <section className="landing-section faq-section"><div className="landing-section-intro"><p className="landing-kicker">COMMON QUESTIONS</p><h2>Clear answers before you begin.</h2></div><div className="faq-list"><details><summary>Does Clinica make the final diagnosis?</summary><p>No. Clinica presents AI-supported possibilities and recommendations for review. The treating clinician remains responsible for the final diagnosis and plan.</p></details><details><summary>Where are assessment records stored?</summary><p>Signed-in clinic records are saved to the configured Supabase project, while each case sheet remains available for review and printing in the workspace.</p></details><details><summary>Who can use the workspace?</summary><p>Clinica is designed for qualified clinicians and care teams who need a structured way to document and review patient assessments.</p></details></div></section>
      <section className="landing-final-cta"><div><p className="landing-kicker">READY WHEN YOU ARE</p><h2>Bring every assessment into one clear workspace.</h2><p>Create your clinic account to start documenting patient assessments, recommendations, and final clinical decisions.</p></div><div className="landing-final-actions"><button className="landing-cta large" onClick={() => { setAuthMode("signup"); setLoginOpen(true); }}>Create your clinic <ArrowRight size={16} /></button><button className="landing-login" onClick={() => { setAuthMode("login"); setLoginOpen(true); }}>Log in</button></div></section>
      <footer className="landing-footer"><div className="landing-brand"><div className="landing-mark"><Stethoscope size={17} /></div><strong>Clinica</strong></div><span>Clinical decision support for clinician-led care.</span><a href="mailto:support@clinica.app">support@clinica.app</a></footer>
      {loginOpen && <div className="login-overlay" role="dialog" aria-modal="true" aria-labelledby="login-title"><form className="login-card" onSubmit={submitLogin}><button type="button" className="login-close" onClick={() => setLoginOpen(false)} aria-label="Close login"><X size={18} /></button><div className="landing-mark"><Stethoscope size={19} /></div><p className="landing-kicker">CLINICA WORKSPACE</p><h2 id="login-title">{authMode === "signup" ? "Create your clinic" : "Sign in to your dashboard"}</h2><p>{authMode === "signup" ? "Set up Clinica for your practice and keep every patient assessment organized." : "Access patient assessments, prediction history, and clinician feedback."}</p>{authMode === "signup" && <><label>Doctor name<input value={doctorName} onChange={(event) => setDoctorName(event.target.value)} placeholder="Dr. Rhea Sharma" /></label><label>Clinic name<input value={clinicName} onChange={(event) => setClinicName(event.target.value)} placeholder="Green Valley Clinic" /></label></>}<label>Email address<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="doctor@clinic.com" /></label><label>Password<input type="password" autoComplete={authMode === "signup" ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={authMode === "signup" ? "At least 6 characters" : "Enter your password"} /></label>{loginError && <div className="login-error"><AlertCircle size={15} />{loginError}</div>}<button className="landing-cta login-submit" disabled={loginBusy}>{loginBusy ? "Please wait..." : authMode === "signup" ? "Create clinic account" : "Sign in"} <ArrowRight size={15} /></button><small>{authMode === "signup" ? "Supabase may ask you to confirm your email before signing in." : "Use an account created in Supabase Authentication."}</small><button type="button" className="auth-switch" onClick={() => { setAuthMode(authMode === "signup" ? "login" : "signup"); setLoginError(""); }}>{authMode === "signup" ? "Already have an account? Sign in" : "New to Clinica? Create your clinic"}</button></form></div>}
    </div>
  );
}
function PlayIcon() { return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.7v8.6l7-4.3-7-4.3Z" /></svg>; }

function WorkspaceView({ view, history, profile, onReturn }: { view: Exclude<View, "assessment">; history: AssessmentRecord[]; profile: DoctorProfile; onReturn: () => void }) {
  const [selectedCase, setSelectedCase] = useState<AssessmentRecord | null>(null);
  const [recordSearch, setRecordSearch] = useState("");
  const [recordDate, setRecordDate] = useState("");
  const serviceStatuses = ["Disease prediction", "Recommendations", "Training data", "Feedback"];
  const matchesFilters = (record: AssessmentRecord) => {
    const query = recordSearch.trim().toLowerCase();
    const searchable = [record.patient_details?.name, record.patient_details?.patientId, record.top_prediction, ...(record.doctor_diagnosis || [])].filter(Boolean).join(" ").toLowerCase();
    const matchesSearch = !query || searchable.includes(query);
    const matchesDate = !recordDate || record.created_at?.slice(0, 10) === recordDate;
    return matchesSearch && matchesDate;
  };
  const filteredHistory = history.filter(matchesFilters);
  const filteredFeedback = history.filter((record) => record.feedback_submitted).filter(matchesFilters);
  return (
    <div className="content workspace-view">
      <p className="eyebrow">CLINICAL WORKSPACE</p>
      <h1>{view === "history" ? "Prediction history" : view === "feedback" ? "Feedback center" : "Workspace settings"}</h1>
      <p className="subheading">{view === "history" ? "Review completed patient assessments saved in Supabase." : view === "feedback" ? "Monitor clinician feedback submitted to improve recommendations." : "Review environment configuration for this workspace."}</p>
      {(view === "history" || view === "feedback") && <div className="record-filters"><label><Search size={15} /><input value={recordSearch} onChange={(event) => setRecordSearch(event.target.value)} placeholder="Search patient, ID, or diagnosis" /></label><label><span>Date</span><input type="date" value={recordDate} onChange={(event) => setRecordDate(event.target.value)} /></label>{(recordSearch || recordDate) && <button type="button" onClick={() => { setRecordSearch(""); setRecordDate(""); }}>Clear filters</button>}</div>}
      {view === "history" && <div className="history-area">{selectedCase ? <CaseSheet record={selectedCase} profile={profile} onClose={() => setSelectedCase(null)} /> : <div className="data-table panel"><div className="table-head"><span>Patient</span><span>Top prediction</span><span>Doctor diagnosis</span><span>Date</span><span>Case sheet</span></div>{filteredHistory.length ? filteredHistory.map((record, index) => <div className="table-row" key={record.id || index}><span><strong>{record.patient_details?.name || "Unnamed patient"}</strong><small>{record.patient_details?.patientId || "No patient ID"}</small></span><span>{record.top_prediction}</span><span>{record.doctor_diagnosis?.join(", ") || "Pending"}</span><span>{record.created_at ? new Date(record.created_at).toLocaleDateString() : "Recent"}</span><button className="case-button" onClick={() => setSelectedCase(record)}><ClipboardCheck size={14} /> Open</button></div>) : <div className="empty-row">{history.length ? "No assessments match these filters." : "No assessments saved yet. Complete an assessment to see it here."}</div>}</div>}</div>}
      {view === "feedback" && <div className="feedback-list">{filteredFeedback.length ? filteredFeedback.map((record, index) => <FeedbackRecord key={record.id || index} record={record} />) : <div className="empty-row panel">{history.some((record) => record.feedback_submitted) ? "No submitted feedback matches these filters." : "No feedback submitted yet. Submit feedback from a completed assessment to see the real record here."}</div>}</div>}
      {view === "settings" && <div className="settings-layout"><div className="settings-card panel"><div><strong>Supabase project</strong><span>{import.meta.env.VITE_SUPABASE_URL || "Not configured"}</span></div><div><strong>API proxy</strong><span>Enabled</span></div><div><strong>Data persistence</strong><span>{history.length ? "Supabase PostgreSQL connected" : "Ready for assessments"}</span></div></div><section className="service-status panel"><div><p className="eyebrow">SYSTEM STATUS</p><h2>Clinical services</h2><p>Configured services used by this workspace.</p></div><div className="service-status-list">{serviceStatuses.map((service) => <div key={service}><span>{service}</span><span className="status-online"><i /> Configured</span></div>)}</div></section></div>}
      <button className="primary-button back-button" onClick={onReturn}><LayoutDashboard size={16} /> Return to dashboard</button>
    </div>
  );
}

function FeedbackRecord({ record }: { record: AssessmentRecord }) {
  const suggested = record.suggested_recommendations || {};
  const final = record.final_recommendations || {};
  const summary = (recommendations: typeof suggested) => `${recommendations.medications?.length || 0} medications · ${recommendations.pathology_tests?.length || 0} pathology · ${recommendations.radiology_tests?.length || 0} radiology`;

  return <div className="feedback-record panel">
    <div className="feedback-record-head"><div><strong>{record.patient_details?.name || "Unnamed patient"}</strong><span>{record.top_prediction} · {record.created_at ? new Date(record.created_at).toLocaleDateString() : "Recent"}</span></div><span className="status-online"><i /> Submitted</span></div>
    <div className="feedback-columns"><div><b>AI suggested</b><span>{summary(suggested)}</span></div><div><b>Final doctor recommendation</b><span>{summary(final)}</span></div></div>
    <details className="feedback-details">
      <summary>View recommendation details <ChevronDown size={15} /></summary>
      <div className="feedback-detail-columns">
        <div><b>AI suggested</b><RecommendationList meds={suggested.medications || []} pathology={suggested.pathology_tests || []} radiology={suggested.radiology_tests || []} /></div>
        <div><b>Final doctor recommendation</b><RecommendationList meds={final.medications || []} pathology={final.pathology_tests || []} radiology={final.radiology_tests || []} /></div>
      </div>
    </details>
  </div>;
}

function CaseSheet({ record, profile, onClose }: { record: AssessmentRecord; profile: DoctorProfile; onClose: () => void }) {
  const suggested = record.suggested_recommendations || {};
  const final = record.final_recommendations || {};
  return <div className="case-sheet panel"><div className="case-actions"><button className="outline-button" onClick={onClose}>Back to history</button><button className="primary-button print-button" onClick={() => window.print()}><Printer size={16} /> Print case sheet</button></div><div className="case-header"><div><div className="case-clinic"><div className="landing-mark"><Stethoscope size={16} /></div><div><strong>Clinica</strong><span>{profile.clinic}</span></div></div><p className="eyebrow">PATIENT CASE SHEET</p><h2>{record.patient_details?.name || "Unnamed patient"}</h2><p>Assessment date: {record.created_at ? new Date(record.created_at).toLocaleString() : "Recent"}</p><p className="case-doctor">Prepared by: {profile.name}</p></div><span className="status-online"><i /> {record.feedback_submitted ? "Feedback submitted" : "Review pending"}</span></div><div className="case-meta"><span><b>Patient ID</b>{record.patient_details?.patientId || "Not provided"}</span><span><b>Age</b>{record.patient_details?.age || "Not provided"}</span><span><b>Doctor diagnosis</b>{record.doctor_diagnosis?.join(", ") || "Pending"}</span></div><div className="case-section"><h3>Symptoms recorded</h3><div className="case-tags">{(record.symptoms || []).map((item) => <span key={item}>{item}</span>)}</div></div><div className="case-section"><h3>AI prediction</h3><p className="case-prediction">{record.top_prediction}<small>Decision support only. Not a confirmed diagnosis.</small></p></div><div className="case-recommendation-grid"><div className="case-section"><h3>AI suggested</h3><RecommendationList meds={suggested.medications || []} pathology={suggested.pathology_tests || []} radiology={suggested.radiology_tests || []} /></div><div className="case-section"><h3>Final doctor recommendation</h3><RecommendationList meds={final.medications || []} pathology={final.pathology_tests || []} radiology={final.radiology_tests || []} /></div></div><p className="case-footer">This case sheet is a clinical decision-support record. Treatment decisions remain the responsibility of the qualified clinician.</p></div>;
}

export default App;

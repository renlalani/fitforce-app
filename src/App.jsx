import { useState, useEffect, useRef } from "react";

const C = {
  bg:"#080808",bgCard:"#111",bgCard2:"#181818",bgCard3:"#1f1f1f",
  red:"#e02020",redDark:"#a01515",
  text:"#f0f0f0",textMuted:"#777",textDim:"#444",
  border:"#222",border2:"#2a2a2a",
  green:"#22c55e",yellow:"#f59e0b",blue:"#3b82f6",purple:"#a855f7",orange:"#f97316",teal:"#14b8a6"
};

const EXERCISE_SVG = (muscle) => {
  const m = muscle || "Core";
  const svgs = {
    Chest:`<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" rx="10" fill="#e0202015"/><text x="40" y="28" text-anchor="middle" fill="#e02020" font-size="22">🏋️</text><rect x="15" y="35" width="50" height="8" rx="4" fill="#e0202040"/><rect x="10" y="30" width="12" height="18" rx="6" fill="#e02020"/><rect x="58" y="30" width="12" height="18" rx="6" fill="#e02020"/><ellipse cx="26" cy="52" rx="8" ry="10" fill="#e0202060"/><ellipse cx="54" cy="52" rx="8" ry="10" fill="#e0202060"/><text x="40" y="72" text-anchor="middle" fill="#e02020" font-size="9" font-weight="bold">CHEST</text></svg>`,
    Back:`<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" rx="10" fill="#3b82f615"/><text x="40" y="26" text-anchor="middle" fill="#3b82f6" font-size="20">🏋️</text><path d="M20 35 Q40 28 60 35 L58 60 Q40 65 22 60 Z" fill="#3b82f640"/><line x1="40" y1="35" x2="40" y2="60" stroke="#3b82f6" stroke-width="2"/><line x1="25" y1="40" x2="55" y2="40" stroke="#3b82f660" stroke-width="1.5"/><line x1="25" y1="48" x2="55" y2="48" stroke="#3b82f660" stroke-width="1.5"/><text x="40" y="74" text-anchor="middle" fill="#3b82f6" font-size="9" font-weight="bold">BACK</text></svg>`,
    Legs:`<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" rx="10" fill="#22c55e15"/><text x="40" y="20" text-anchor="middle" fill="#22c55e" font-size="18">🦵</text><rect x="28" y="24" width="24" height="18" rx="6" fill="#22c55e50"/><rect x="20" y="40" width="16" height="24" rx="6" fill="#22c55e60"/><rect x="44" y="40" width="16" height="24" rx="6" fill="#22c55e60"/><rect x="22" y="62" width="14" height="10" rx="4" fill="#22c55e80"/><rect x="44" y="62" width="14" height="10" rx="4" fill="#22c55e80"/><text x="40" y="78" text-anchor="middle" fill="#22c55e" font-size="9" font-weight="bold">LEGS</text></svg>`,
    Shoulders:`<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" rx="10" fill="#f59e0b15"/><text x="40" y="24" text-anchor="middle" fill="#f59e0b" font-size="18">💪</text><ellipse cx="20" cy="38" rx="12" ry="10" fill="#f59e0b60"/><ellipse cx="60" cy="38" rx="12" ry="10" fill="#f59e0b60"/><rect x="28" y="32" width="24" height="30" rx="6" fill="#f59e0b40"/><circle cx="20" cy="34" r="7" fill="#f59e0b80"/><circle cx="60" cy="34" r="7" fill="#f59e0b80"/><text x="40" y="74" text-anchor="middle" fill="#f59e0b" font-size="9" font-weight="bold">SHOULDERS</text></svg>`,
    Arms:`<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" rx="10" fill="#a855f715"/><text x="40" y="24" text-anchor="middle" fill="#a855f7" font-size="18">💪</text><path d="M15 60 Q12 40 20 30 Q28 22 36 28 Q44 34 40 48 L38 60Z" fill="#a855f750"/><path d="M65 60 Q68 40 60 30 Q52 22 44 28 Q36 34 40 48 L42 60Z" fill="#a855f750"/><ellipse cx="30" cy="38" rx="10" ry="8" fill="#a855f780"/><ellipse cx="50" cy="38" rx="10" ry="8" fill="#a855f780"/><text x="40" y="74" text-anchor="middle" fill="#a855f7" font-size="9" font-weight="bold">ARMS</text></svg>`,
    Core:`<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" rx="10" fill="#f9731615"/><text x="40" y="22" text-anchor="middle" fill="#f97316" font-size="18">🔥</text><rect x="28" y="26" width="24" height="42" rx="8" fill="#f9731640"/><line x1="40" y1="26" x2="40" y2="68" stroke="#f97316" stroke-width="2"/><line x1="28" y1="36" x2="52" y2="36" stroke="#f9731660" stroke-width="1.5"/><line x1="28" y1="45" x2="52" y2="45" stroke="#f9731660" stroke-width="1.5"/><line x1="28" y1="54" x2="52" y2="54" stroke="#f9731660" stroke-width="1.5"/><text x="40" y="76" text-anchor="middle" fill="#f97316" font-size="9" font-weight="bold">CORE</text></svg>`,
    Cardio:`<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" rx="10" fill="#14b8a615"/><text x="40" y="22" text-anchor="middle" fill="#14b8a6" font-size="18">🏃</text><path d="M10 50 L20 30 L30 45 L40 20 L50 40 L60 35 L70 50" stroke="#14b8a6" stroke-width="3" fill="none" stroke-linecap="round"/><text x="40" y="76" text-anchor="middle" fill="#14b8a6" font-size="9" font-weight="bold">CARDIO</text></svg>`,
    Glutes:`<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" rx="10" fill="#e0202015"/><ellipse cx="28" cy="48" rx="16" ry="18" fill="#e0202060"/><ellipse cx="52" cy="48" rx="16" ry="18" fill="#e0202060"/><text x="40" y="76" text-anchor="middle" fill="#e02020" font-size="9" font-weight="bold">GLUTES</text></svg>`,
  };
  return svgs[m] || svgs["Core"];
};

const EXERCISES = [
  {id:1,name:"Bench Press",muscle:"Chest",level:"Beginner",sets:3,reps:"8-10",rest:90,cal:180,desc:"Lie flat, grip bar shoulder-width, lower to chest, press up explosively."},
  {id:2,name:"Incline DB Press",muscle:"Chest",level:"Intermediate",sets:4,reps:"10-12",rest:75,cal:160,desc:"45° bench, press dumbbells from chest. Targets upper chest."},
  {id:3,name:"Cable Fly",muscle:"Chest",level:"Advanced",sets:3,reps:"12-15",rest:60,cal:130,desc:"Arms wide, squeeze chest at center, controlled return."},
  {id:4,name:"Push-Ups",muscle:"Chest",level:"Beginner",sets:3,reps:"15-20",rest:60,cal:100,desc:"Hands shoulder-width, lower chest to floor, press up."},
  {id:5,name:"Dumbbell Pullover",muscle:"Chest",level:"Intermediate",sets:3,reps:"12",rest:75,cal:140,desc:"Lower dumbbell behind head, pull back over chest."},
  {id:6,name:"Pull-Ups",muscle:"Back",level:"Intermediate",sets:3,reps:"6-10",rest:90,cal:150,desc:"Dead hang, pull chest to bar, lower controlled."},
  {id:7,name:"Deadlift",muscle:"Back",level:"Advanced",sets:4,reps:"5",rest:180,cal:300,desc:"Hip hinge, bar close, drive through heels, lock out at top."},
  {id:8,name:"Barbell Row",muscle:"Back",level:"Intermediate",sets:4,reps:"8-10",rest:90,cal:200,desc:"Hinge 45°, pull bar to lower chest, squeeze shoulder blades."},
  {id:9,name:"Lat Pulldown",muscle:"Back",level:"Beginner",sets:3,reps:"10-12",rest:75,cal:140,desc:"Wide grip, pull to upper chest, lean slightly back."},
  {id:10,name:"Seated Cable Row",muscle:"Back",level:"Beginner",sets:3,reps:"12",rest:75,cal:130,desc:"Sit upright, pull handle to belly, squeeze shoulder blades."},
  {id:11,name:"Squat",muscle:"Legs",level:"Beginner",sets:4,reps:"8-12",rest:120,cal:250,desc:"Feet shoulder-width, sit back and down, knees track toes."},
  {id:12,name:"Leg Press",muscle:"Legs",level:"Beginner",sets:4,reps:"12-15",rest:90,cal:200,desc:"Feet shoulder-width on plate, press to near lockout."},
  {id:13,name:"Romanian DL",muscle:"Legs",level:"Intermediate",sets:3,reps:"10-12",rest:90,cal:220,desc:"Hinge at hips, back flat, feel hamstring stretch."},
  {id:14,name:"Leg Curl",muscle:"Legs",level:"Beginner",sets:3,reps:"12-15",rest:60,cal:120,desc:"Curl weight towards glutes, squeeze at top."},
  {id:15,name:"Bulgarian Split Squat",muscle:"Legs",level:"Advanced",sets:3,reps:"10",rest:90,cal:200,desc:"Rear foot elevated, lower until front thigh parallel."},
  {id:16,name:"Hip Thrust",muscle:"Glutes",level:"Intermediate",sets:4,reps:"12-15",rest:75,cal:180,desc:"Upper back on bench, drive hips up, squeeze glutes at top."},
  {id:17,name:"Glute Kickback",muscle:"Glutes",level:"Beginner",sets:3,reps:"15",rest:60,cal:100,desc:"On cable, kick leg back, squeeze glute at peak."},
  {id:18,name:"Overhead Press",muscle:"Shoulders",level:"Intermediate",sets:3,reps:"8-10",rest:90,cal:170,desc:"Press bar overhead, lock out, lower to clavicle."},
  {id:19,name:"Lateral Raises",muscle:"Shoulders",level:"Beginner",sets:3,reps:"15-20",rest:60,cal:100,desc:"Raise dumbbells to shoulder height, control descent."},
  {id:20,name:"Face Pulls",muscle:"Shoulders",level:"Intermediate",sets:3,reps:"15-20",rest:60,cal:110,desc:"Pull rope to face, elbows high, external rotation."},
  {id:21,name:"Arnold Press",muscle:"Shoulders",level:"Intermediate",sets:3,reps:"10-12",rest:75,cal:150,desc:"Start palms facing you, rotate and press overhead."},
  {id:22,name:"Bicep Curls",muscle:"Arms",level:"Beginner",sets:3,reps:"10-12",rest:60,cal:100,desc:"Curl to shoulders, squeeze at top, slow negative."},
  {id:23,name:"Tricep Dips",muscle:"Arms",level:"Intermediate",sets:3,reps:"10-15",rest:60,cal:130,desc:"Lower until elbows at 90°, press up."},
  {id:24,name:"Hammer Curls",muscle:"Arms",level:"Beginner",sets:3,reps:"10-12",rest:60,cal:100,desc:"Neutral grip, targets brachialis and forearm."},
  {id:25,name:"Skull Crushers",muscle:"Arms",level:"Intermediate",sets:3,reps:"10-12",rest:75,cal:120,desc:"Lower bar to forehead, extend back up."},
  {id:26,name:"Cable Pushdown",muscle:"Arms",level:"Beginner",sets:3,reps:"12-15",rest:60,cal:100,desc:"Push rope down, flare at bottom, squeeze triceps."},
  {id:27,name:"Plank",muscle:"Core",level:"Beginner",sets:3,reps:"45s",rest:45,cal:60,desc:"Straight body on forearms and toes, brace core."},
  {id:28,name:"Cable Crunch",muscle:"Core",level:"Intermediate",sets:3,reps:"15-20",rest:60,cal:90,desc:"Kneel at cable, crunch forward, cramp abs at bottom."},
  {id:29,name:"Dragon Flag",muscle:"Core",level:"Advanced",sets:3,reps:"6-8",rest:90,cal:150,desc:"Lay on bench, keep body rigid, lower slowly."},
  {id:30,name:"Hanging Leg Raise",muscle:"Core",level:"Intermediate",sets:3,reps:"12-15",rest:60,cal:110,desc:"Hang from bar, raise legs to 90°, lower controlled."},
  {id:31,name:"Ab Wheel Rollout",muscle:"Core",level:"Advanced",sets:3,reps:"10",rest:75,cal:130,desc:"Roll forward until body parallel, pull back with core."},
  {id:32,name:"Treadmill Run",muscle:"Cardio",level:"Beginner",sets:1,reps:"20 min",rest:0,cal:250,desc:"Steady 60-70% max HR, great for base aerobic fitness."},
  {id:33,name:"HIIT Intervals",muscle:"Cardio",level:"Advanced",sets:8,reps:"30s on/off",rest:0,cal:350,desc:"Sprint at 90%+ effort, full recovery between rounds."},
  {id:34,name:"Jump Rope",muscle:"Cardio",level:"Beginner",sets:3,reps:"3 min",rest:60,cal:200,desc:"Skip continuously, light on toes. Great conditioning."},
  {id:35,name:"Rowing Machine",muscle:"Cardio",level:"Intermediate",sets:1,reps:"15 min",rest:0,cal:220,desc:"Full body cardio, drive with legs, pull to chest."},
];

const WORKOUT_PLANS = [
  {id:1,name:"Beginner Full Body",level:"Beginner",days:3,duration:"45 min",goal:"Foundation",color:C.green,exercises:[1,9,11,19,22,27,32]},
  {id:2,name:"Intermediate PPL",level:"Intermediate",days:6,duration:"60 min",goal:"Muscle Growth",color:C.blue,exercises:[1,2,18,19,6,8,11,13,22,23,27,28]},
  {id:3,name:"Advanced Power",level:"Advanced",days:5,duration:"90 min",goal:"Strength",color:C.red,exercises:[7,11,1,6,18,3,29,33]},
  {id:4,name:"Fat Burn HIIT",level:"Beginner",days:4,duration:"40 min",goal:"Weight Loss",color:C.yellow,exercises:[32,33,34,11,27,30]},
  {id:5,name:"Glute & Legs",level:"Intermediate",days:4,duration:"55 min",goal:"Lower Body",color:C.purple,exercises:[11,16,13,14,15,17,27]},
  {id:6,name:"Shoulder Spec.",level:"Intermediate",days:4,duration:"50 min",goal:"Shoulders",color:C.orange,exercises:[18,19,20,21,6,27]},
];

const FOOD_DB = [
  {name:"Chicken Breast (100g)",cal:165,protein:31,carbs:0,fat:3.6},
  {name:"Brown Rice (100g)",cal:111,protein:2.6,carbs:23,fat:0.9},
  {name:"Oats (100g)",cal:389,protein:17,carbs:66,fat:7},
  {name:"Whole Eggs (1 egg)",cal:78,protein:6,carbs:0.6,fat:5},
  {name:"Salmon (100g)",cal:208,protein:20,carbs:0,fat:13},
  {name:"Broccoli (100g)",cal:34,protein:2.8,carbs:7,fat:0.4},
  {name:"Banana (1 medium)",cal:105,protein:1.3,carbs:27,fat:0.4},
  {name:"Peanut Butter (1 tbsp)",cal:94,protein:4,carbs:3,fat:8},
  {name:"Whey Protein (1 scoop)",cal:120,protein:25,carbs:3,fat:2},
  {name:"Sweet Potato (100g)",cal:86,protein:1.6,carbs:20,fat:0.1},
  {name:"Greek Yogurt (100g)",cal:59,protein:10,carbs:3.6,fat:0.4},
  {name:"Almonds (30g)",cal:174,protein:6,carbs:6,fat:15},
  {name:"Tuna (100g)",cal:116,protein:25,carbs:0,fat:1},
  {name:"White Rice (100g)",cal:130,protein:2.7,carbs:28,fat:0.3},
  {name:"Beef Mince (100g)",cal:250,protein:26,carbs:0,fat:17},
  {name:"Milk Full (250ml)",cal:150,protein:8,carbs:12,fat:8},
  {name:"Lentils cooked (100g)",cal:116,protein:9,carbs:20,fat:0.4},
];

const MUSCLES = ["All","Chest","Back","Legs","Glutes","Shoulders","Arms","Core","Cardio"];
const muscleColor = {Chest:C.red,Back:C.blue,Legs:C.green,Glutes:C.red,Shoulders:C.yellow,Arms:C.purple,Core:C.orange,Cardio:C.teal};

const OL = {position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16,overflowY:"auto"};
const MOD = {background:C.bgCard,border:`1px solid ${C.border2}`,borderRadius:16,padding:"20px",width:"100%",maxWidth:460};
const RBTN = {background:C.red,color:"#fff",border:"none",borderRadius:8,padding:"12px 20px",cursor:"pointer",fontSize:13,fontWeight:500};
const INP = {background:C.bgCard2,border:`1px solid ${C.border2}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"};

function Tag({label, color}) {
  return (
    <span style={{fontSize:11,padding:"3px 8px",borderRadius:6,background:color+"20",color,border:`1px solid ${color}30`,display:"inline-block",marginRight:4,marginBottom:4}}>
      {label}
    </span>
  );
}

function Badge({label, color}) {
  return (
    <span style={{fontSize:11,padding:"2px 8px",borderRadius:20,border:`1px solid ${color}`,color,fontWeight:500}}>
      {label}
    </span>
  );
}

function MBar({label, val, max, color}) {
  const p = Math.min(100, Math.round((val/max)*100));
  return (
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
        <span style={{color:C.textMuted}}>{label}</span>
        <span style={{color}}>{val}<span style={{color:C.textDim}}>/{max}</span></span>
      </div>
      <div style={{height:6,background:C.border,borderRadius:3,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${p}%`,background:color,borderRadius:3}} />
      </div>
    </div>
  );
}

function MiniChart({data, color, label}) {
  if (!data || data.length < 2) return null;
  const vals = data.map(d => +(d.value || d.weight || 0));
  const min = Math.min(...vals), max = Math.max(...vals), range = max - min || 1;
  const W = 280, H = 70, pad = 10;
  const pts = vals.map((v,i) => `${pad+i*(W-pad*2)/(vals.length-1)},${H-pad-(v-min)/range*(H-pad*2)}`).join(" ");
  return (
    <div style={{marginBottom:12}}>
      <div style={{fontSize:11,color:C.textMuted,marginBottom:4}}>{label}</div>
      <div style={{background:C.bgCard2,borderRadius:10,padding:"8px",overflow:"hidden"}}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
          <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          {vals.map((v,i) => (
            <circle key={i} cx={pad+i*(W-pad*2)/(vals.length-1)} cy={H-pad-(v-min)/range*(H-pad*2)} r="3" fill={color}/>
          ))}
          <text x={pad} y={H} fill={C.textMuted} fontSize="8">{data[0].date||""}</text>
          <text x={W-pad} y={H} fill={C.textMuted} fontSize="8" textAnchor="end">{data[data.length-1].date||""}</text>
          <text x={W-pad} y={H-pad-(vals[vals.length-1]-min)/range*(H-pad*2)-4} fill={color} fontSize="9" textAnchor="end">{vals[vals.length-1]}</text>
        </svg>
      </div>
    </div>
  );
}

function WorkoutModal({plan, onClose, onXp}) {
  const exList = plan.exercises.map(id => EXERCISES.find(e => e.id===id)).filter(Boolean);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("work");
  const [setNum, setSetNum] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [restCount, setRestCount] = useState(0);
  const [done, setDone] = useState(false);
  const [weights, setWeights] = useState({});
  const [completedSets, setCompletedSets] = useState([]);

  useEffect(() => {
    const t = setInterval(() => setElapsed(p => p+1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (phase !== "rest") return;
    const t = setInterval(() => {
      setRestCount(p => {
        if (p <= 1) { clearInterval(t); setPhase("work"); setSetNum(s => s+1); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  const fmt = s => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;
  const cur = exList[idx];
  const totalSets = exList.reduce((s,e) => s+(e.sets||3), 0);
  const doneSets = exList.slice(0,idx).reduce((s,e) => s+(e.sets||3), 0) + setNum - 1;

  const nextSet = () => {
    setCompletedSets(p => [...p, {name:cur.name, set:setNum, weight:weights[`${cur.id}_${setNum}`]||0}]);
    if (setNum < (cur.sets||3)) {
      setPhase("rest"); setRestCount(cur.rest||60);
    } else {
      if (idx < exList.length-1) { setIdx(p=>p+1); setSetNum(1); setPhase("work"); }
      else setDone(true);
    }
  };

  if (done) {
    return (
      <div style={OL}>
        <div style={MOD}>
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:52,marginBottom:10}}>🏆</div>
            <h2 style={{color:C.text,margin:"0 0 8px"}}>Workout Complete!</h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,margin:"16px 0"}}>
              {[["Time",fmt(elapsed),C.yellow],["Sets",completedSets.length,C.blue],["~Cal",completedSets.length*15+Math.floor(elapsed/60)*8,C.red]].map(([l,v,c]) => (
                <div key={l} style={{background:C.bgCard2,borderRadius:8,padding:"10px",textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:600,color:c}}>{v}</div>
                  <div style={{fontSize:10,color:C.textMuted}}>{l}</div>
                </div>
              ))}
            </div>
            <button onClick={() => { onXp(50); onClose(); }} style={{...RBTN,width:"100%"}}>Finish & Save (+50 XP)</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={OL}>
      <div style={{...MOD,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
          <div>
            <div style={{fontSize:12,color:C.textMuted}}>{plan.name}</div>
            <div style={{fontSize:13,color:C.red}}>Ex {idx+1}/{exList.length}</div>
          </div>
          <div style={{fontSize:20,fontWeight:600,color:C.yellow,fontVariantNumeric:"tabular-nums"}}>{fmt(elapsed)}</div>
        </div>
        <div style={{height:4,background:C.border,borderRadius:2,marginBottom:14,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${(doneSets/totalSets)*100}%`,background:C.red,borderRadius:2}} />
        </div>
        {phase === "rest" ? (
          <div style={{textAlign:"center",padding:"24px 0"}}>
            <div style={{fontSize:11,color:C.textMuted,marginBottom:8,letterSpacing:1}}>REST TIME</div>
            <div style={{fontSize:64,fontWeight:700,color:C.blue,fontVariantNumeric:"tabular-nums"}}>{restCount}s</div>
            <p style={{color:C.textMuted,fontSize:13}}>Next: Set {setNum+1} of {cur.sets}</p>
            <button onClick={() => { setPhase("work"); setSetNum(s=>s+1); }} style={{...RBTN,background:C.bgCard2,border:`1px solid ${C.border2}`,color:C.text,marginTop:8}}>Skip Rest</button>
          </div>
        ) : (
          <>
            <div style={{display:"flex",gap:12,marginBottom:12}}>
              <div style={{width:70,height:70,flexShrink:0,borderRadius:10,overflow:"hidden"}} dangerouslySetInnerHTML={{__html:EXERCISE_SVG(cur.muscle)}} />
              <div>
                <h3 style={{color:C.text,margin:"0 0 4px",fontSize:17}}>{cur.name}</h3>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  <Tag label={`${cur.sets} sets`} color={C.red}/>
                  <Tag label={cur.reps+" reps"} color={C.blue}/>
                  <Tag label={`${cur.rest}s rest`} color={C.yellow}/>
                </div>
              </div>
            </div>
            <p style={{color:C.textMuted,fontSize:12,lineHeight:1.6,marginBottom:12}}>{cur.desc}</p>
            <div style={{background:C.bgCard2,border:`1px solid ${C.border2}`,borderRadius:10,padding:"12px",marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{color:C.textMuted,fontSize:13}}>Set {setNum} of {cur.sets}</span>
                <span style={{color:C.green,fontSize:13}}>{setNum-1} done</span>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <input type="number" placeholder="Weight (kg)" value={weights[`${cur.id}_${setNum}`]||""} onChange={e => setWeights(p => ({...p,[`${cur.id}_${setNum}`]:e.target.value}))} style={{...INP,flex:1}}/>
                <span style={{color:C.textMuted,fontSize:13,whiteSpace:"nowrap"}}>× {cur.reps}</span>
              </div>
            </div>
            <button onClick={nextSet} style={{...RBTN,width:"100%",fontSize:14}}>
              {setNum < (cur.sets||3) ? `Complete Set ${setNum} →` : "Next Exercise →"}
            </button>
          </>
        )}
        <button onClick={onClose} style={{width:"100%",marginTop:8,background:"transparent",border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:8,padding:"8px",cursor:"pointer",fontSize:13}}>Quit Workout</button>
      </div>
    </div>
  );
}

function MealModal({onAdd, onClose}) {
  const [search, setSearch] = useState("");
  const [qty, setQty] = useState(1);
  const [mealTime, setMealTime] = useState("Breakfast");
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("search");
  const [custom, setCustom] = useState({name:"",cal:"",protein:"",carbs:"",fat:""});
  const filtered = FOOD_DB.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  const calc = f => selected ? Math.round(selected[f]*qty) : 0;

  return (
    <div style={OL}>
      <div style={{...MOD,maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <h3 style={{color:C.text,margin:0}}>Add Meal</h3>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:C.textMuted,fontSize:22,cursor:"pointer"}}>×</button>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:12}}>
          {["search","custom"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{flex:1,padding:"8px",borderRadius:8,border:`1px solid ${mode===m?C.red:C.border}`,background:mode===m?C.red+"20":"transparent",color:mode===m?C.red:C.textMuted,cursor:"pointer",fontSize:13}}>
              {m==="search"?"Food Database":"Custom Food"}
            </button>
          ))}
        </div>
        {mode === "search" ? (
          <>
            <input placeholder="Search food..." value={search} onChange={e => setSearch(e.target.value)} style={{...INP,marginBottom:8}}/>
            <div style={{maxHeight:190,overflowY:"auto",marginBottom:10}}>
              {filtered.map((f,i) => (
                <div key={i} onClick={() => setSelected(f)} style={{padding:"9px 12px",borderRadius:8,marginBottom:4,cursor:"pointer",background:selected?.name===f.name?C.red+"25":C.bgCard2,border:`1px solid ${selected?.name===f.name?C.red:C.border}`}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:13,color:C.text}}>{f.name}</span>
                    <div style={{display:"flex",gap:8,fontSize:11}}>
                      <span style={{color:C.red}}>{f.cal} kcal</span>
                      <span style={{color:C.blue}}>{f.protein}g P</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {selected && (
              <>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <span style={{fontSize:12,color:C.textMuted}}>Qty:</span>
                  <button onClick={() => setQty(q => Math.max(0.5, +(q-0.5).toFixed(1)))} style={{background:C.bgCard3,border:`1px solid ${C.border}`,borderRadius:6,width:28,height:28,cursor:"pointer",color:C.text,fontSize:16}}>−</button>
                  <span style={{fontSize:14,fontWeight:500,color:C.text,minWidth:30,textAlign:"center"}}>{qty}</span>
                  <button onClick={() => setQty(q => +(q+0.5).toFixed(1))} style={{background:C.bgCard3,border:`1px solid ${C.border}`,borderRadius:6,width:28,height:28,cursor:"pointer",color:C.text,fontSize:16}}>+</button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:12}}>
                  {[["Cal",calc("cal"),"kcal",C.red],["Protein",calc("protein"),"g",C.blue],["Carbs",calc("carbs"),"g",C.yellow],["Fat",calc("fat"),"g",C.green]].map(([l,v,u,col]) => (
                    <div key={l} style={{textAlign:"center",background:C.bgCard3,borderRadius:8,padding:"8px 4px"}}>
                      <div style={{fontSize:16,fontWeight:500,color:col}}>{v}</div>
                      <div style={{fontSize:10,color:C.textMuted}}>{l}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div style={{marginBottom:12}}>
            {[["Food name","name","text"],["Calories","cal","number"],["Protein (g)","protein","number"],["Carbs (g)","carbs","number"],["Fat (g)","fat","number"]].map(([l,k,t]) => (
              <div key={k} style={{marginBottom:8}}>
                <label style={{fontSize:12,color:C.textMuted,display:"block",marginBottom:4}}>{l}</label>
                <input type={t} placeholder={l} value={custom[k]} onChange={e => setCustom(p => ({...p,[k]:e.target.value}))} style={INP}/>
              </div>
            ))}
          </div>
        )}
        <div style={{marginBottom:12}}>
          <label style={{fontSize:12,color:C.textMuted,display:"block",marginBottom:6}}>Meal Time</label>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {["Breakfast","Lunch","Post-Workout","Dinner","Snack"].map(t => (
              <button key={t} onClick={() => setMealTime(t)} style={{padding:"5px 12px",borderRadius:20,border:`1px solid ${mealTime===t?C.red:C.border}`,background:mealTime===t?C.red+"20":"transparent",color:mealTime===t?C.red:C.textMuted,cursor:"pointer",fontSize:12}}>{t}</button>
            ))}
          </div>
        </div>
        <button
          onClick={() => {
            if (mode==="search" && selected) onAdd({name:selected.name,mealTime,qty,cal:calc("cal"),protein:calc("protein"),carbs:calc("carbs"),fat:calc("fat")});
            else if (mode==="custom" && custom.name) onAdd({name:custom.name,mealTime,qty:1,cal:+custom.cal||0,protein:+custom.protein||0,carbs:+custom.carbs||0,fat:+custom.fat||0});
            onClose();
          }}
          disabled={mode==="search"?!selected:!custom.name}
          style={{...RBTN,width:"100%",opacity:(mode==="search"?!selected:!custom.name)?0.5:1}}
        >Add to Log</button>
      </div>
    </div>
  );
}

function WaterTracker({water, setWater}) {
  const goal = 8;
  return (
    <div style={{background:C.bgCard,border:`1px solid ${C.border2}`,borderRadius:12,padding:"14px",marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <h3 style={{color:C.text,margin:0,fontSize:14}}>Water Intake</h3>
        <span style={{color:C.teal,fontSize:13,fontWeight:500}}>{water}/{goal} glasses</span>
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
        {Array.from({length:goal},(_,i) => (
          <div key={i} onClick={() => setWater(i < water ? i : i+1)} style={{width:28,height:36,borderRadius:6,background:i<water?C.teal:C.bgCard2,border:`1px solid ${i<water?C.teal:C.border}`,cursor:"pointer"}}/>
        ))}
      </div>
      <div style={{display:"flex",gap:6}}>
        <button onClick={() => setWater(w => Math.min(goal,w+1))} style={{flex:1,background:C.teal+"20",border:`1px solid ${C.teal}44`,color:C.teal,borderRadius:8,padding:"7px",cursor:"pointer",fontSize:12}}>+ Add Glass</button>
        <button onClick={() => setWater(0)} style={{background:C.bgCard2,border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:8,padding:"7px 12px",cursor:"pointer",fontSize:12}}>Reset</button>
      </div>
    </div>
  );
}

function AICoach({profile, totalCal, totalProt, water, level, xp}) {
  const [msgs, setMsgs] = useState([{role:"ai",text:"Hey! I'm your AI coach — no login needed on any device. Ask me about workouts, nutrition, form, recovery, or supplements! 💪"}]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("chat");
  const [weekPlan, setWeekPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [msgs]);

  const systemPrompt = `You are FitForce AI Coach, an expert personal trainer and nutritionist. User: ${profile.name}, Level: ${profile.level}, Goal: ${profile.goal}, Weight: ${profile.weight}kg, Height: ${profile.height}cm, Age: ${profile.age}, Gender: ${profile.gender}. Today: ${totalCal} kcal eaten, ${totalProt}g protein, ${water} glasses water. Fitness Level ${level} (${xp} XP). Be concise, energetic, expert. No markdown. Max 150 words.`;

  const [rateLimited, setRateLimited] = useState(null); // null or Date resetsAt

  const callAI = async (messages, sys, maxTok) => {
    const res = await fetch( "https://zenmux.ai/api/v1/chat/completions", {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Authorization": "Bearer sk-ai-v1-bdf931612ea78390618ee9df6dec3ed91bbdd25640cc5cf899b4c5d5a604dafe"
      },
      body: JSON.stringify({
        model:"z-ai/glm-5.2-free",
        max_tokens: maxTok || 800,
        messages:[
          { role:"system", content: sys || systemPrompt },
          ...messages
        ]
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const body = err?.error || err;
      if (body?.type === "exceeded_limit" || res.status === 429) {
        const resetsAt = body?.resetsAt || body?.windows?.["5h"]?.resets_at;
        setRateLimited(resetsAt ? new Date(resetsAt * 1000) : new Date(Date.now() + 3600000));
        throw new Error("RATE_LIMITED");
      }
      throw new Error(body?.message || `HTTP ${res.status}`);
    }
    setRateLimited(null);
    const d = await res.json();
    return d.choices?.[0]?.message?.content || "Try again.";
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setMsgs(p => [...p, {role:"user",text:msg}]);
    setInput("");
    setLoading(true);
    try {
      const history = msgs.filter((_,i) => i > 0).map(m => ({role:m.role==="user"?"user":"assistant",content:m.text}));
      const reply = await callAI([...history,{role:"user",content:msg}]);
      setMsgs(p => [...p, {role:"ai",text:reply}]);
    } catch(e) {
      if (e.message !== "RATE_LIMITED") {
        setMsgs(p => [...p, {role:"ai",text:`Error: ${e.message || "Connection failed. Please try again."}`}]);
      }
    }
    setLoading(false);
  };

  const generateWeekPlan = async () => {
    setPlanLoading(true);
    setWeekPlan(null);
    try {
      const sys = `You are a professional fitness coach. Respond ONLY with valid JSON, no markdown, no backticks, no extra text.`;
      const prompt = `Create a 7-day workout plan for: Level=${profile.level}, Goal=${profile.goal}. Return JSON exactly: {"days":[{"day":"Mon","focus":"Push","exercises":["Bench Press 3x10","OHP 3x10"],"duration":"60 min","note":"tip here"},...],"tips":"summary here"}`;
      const raw = await callAI([{role:"user",content:prompt}], sys, 1200);
      const clean = raw.replace(/```json|```/g,"").trim();
      setWeekPlan(JSON.parse(clean));
    } catch(e) {
      setWeekPlan({error:"Could not generate plan. Try again."});
    }
    setPlanLoading(false);
  };

  const analyzeDay = async () => {
    setAnalyzing(true);
    const calGoal = profile.goal==="Fat Loss"?2000:2800;
    const protGoal = Math.round(+profile.weight*2);
    const prompt = `Analyze today for ${profile.name}: ate ${totalCal} kcal (goal ${calGoal}), ${totalProt}g protein (goal ${protGoal}g), ${water}/8 glasses water. Give 3 specific actionable recommendations. Be direct, max 100 words.`;
    try {
      const reply = await callAI([{role:"user",content:prompt}]);
      setMsgs(p => [...p, {role:"ai",text:"Daily Analysis:\n\n"+reply}]);
      setMode("chat");
    } catch(e) {
      setMsgs(p => [...p, {role:"ai",text:"Analysis failed. Try again."}]);
    }
    setAnalyzing(false);
  };

  const dayColors = {Mon:C.red,Tue:C.blue,Wed:C.green,Thu:C.yellow,Fri:C.purple,Sat:C.orange,Sun:C.teal};

  return (
    <div>
      {rateLimited && (
        <div style={{background:"#f59e0b18",border:`1px solid ${C.yellow}44`,borderRadius:10,padding:"12px 16px",marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:500,color:C.yellow,marginBottom:4}}>⏳ AI Coach is temporarily unavailable</div>
          <div style={{fontSize:12,color:C.textMuted,lineHeight:1.6}}>
            The free API limit has been reached. It resets at{" "}
            <span style={{color:C.yellow}}>{rateLimited.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
            {" "}({rateLimited.toLocaleDateString([],{month:"short",day:"numeric"})}).
          </div>
          <div style={{fontSize:11,color:C.textMuted,marginTop:6}}>
            While you wait — browse the Exercise Library, log your meals, or update your Progress. 💪
          </div>
        </div>
      )}
      <div style={{display:"flex",gap:6,marginBottom:12}}>
        {[["chat","Chat"],["plan","Week Plan"],["analyze","Analyze Day"]].map(([m,l]) => (
          <button key={m} onClick={() => m==="analyze" ? analyzeDay() : setMode(m)}
            style={{flex:1,padding:"8px",borderRadius:8,border:`1px solid ${mode===m?C.red:C.border}`,background:mode===m?C.red+"20":"transparent",color:mode===m?C.red:C.textMuted,cursor:"pointer",fontSize:12}}>
            {m==="analyze" ? (analyzing?"Analyzing...":l) : l}
          </button>
        ))}
      </div>

      {mode === "plan" && (
        <>
          <button onClick={generateWeekPlan} disabled={planLoading} style={{...RBTN,width:"100%",marginBottom:12,opacity:planLoading?0.6:1}}>
            {planLoading ? "Generating your plan..." : "Generate My Week Plan 🗓"}
          </button>
          {weekPlan?.error && <p style={{color:C.red,fontSize:13}}>{weekPlan.error}</p>}
          {weekPlan?.days && (
            <>
              {weekPlan.days.map((d,i) => (
                <div key={i} style={{background:C.bgCard2,border:`1px solid ${C.border2}`,borderRadius:10,padding:"12px",marginBottom:8,borderLeft:`3px solid ${dayColors[d.day]||C.red}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontWeight:500,color:dayColors[d.day]||C.red}}>{d.day}</span>
                    <span style={{fontSize:12,color:C.textMuted}}>{d.focus} · {d.duration}</span>
                  </div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:6}}>
                    {(d.exercises||[]).map((ex,j) => (
                      <span key={j} style={{fontSize:11,padding:"2px 8px",background:C.bgCard3,borderRadius:6,color:C.textMuted,border:`1px solid ${C.border}`}}>{ex}</span>
                    ))}
                  </div>
                  {d.note && <p style={{fontSize:11,color:C.textMuted,margin:0,fontStyle:"italic"}}>{d.note}</p>}
                </div>
              ))}
              {weekPlan.tips && <p style={{fontSize:12,color:C.textMuted,background:C.bgCard2,padding:"10px",borderRadius:8,lineHeight:1.6}}>{weekPlan.tips}</p>}
            </>
          )}
        </>
      )}

      {mode === "chat" && (
        <>
          <div style={{background:C.bgCard,border:`1px solid ${C.border2}`,borderRadius:12,overflow:"hidden",marginBottom:10}}>
            <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,background:C.bgCard2,display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,background:C.red,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13}}>AI</div>
              <div>
                <div style={{fontWeight:500,fontSize:14}}>FitForce AI Coach</div>
                <div style={{fontSize:11,color:C.green}}>● Online · No login required</div>
              </div>
              <div style={{marginLeft:"auto",fontSize:11,color:C.textMuted,textAlign:"right"}}>
                <div>{totalCal} kcal · {totalProt}g P</div>
                <div>Lv.{level}</div>
              </div>
            </div>
            <div ref={chatRef} style={{height:340,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:10}}>
              {msgs.map((m,i) => (
                <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                  <div style={{maxWidth:"82%",padding:"10px 14px",borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",background:m.role==="user"?C.red:C.bgCard2,fontSize:13,lineHeight:1.65,border:`1px solid ${m.role==="user"?C.redDark:C.border}`,whiteSpace:"pre-wrap"}}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{display:"flex",justifyContent:"flex-start"}}>
                  <div style={{padding:"10px 16px",borderRadius:"14px 14px 14px 4px",background:C.bgCard2,border:`1px solid ${C.border}`,fontSize:13,color:C.textMuted}}>Thinking...</div>
                </div>
              )}
            </div>
            <div style={{padding:"10px 12px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8}}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter" && send()} placeholder="Ask your AI coach..." style={{...INP,flex:1}}/>
              <button onClick={send} disabled={loading} style={{...RBTN,padding:"10px 16px",opacity:loading?0.6:1}}>Send</button>
            </div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {["Best workout for my level","Meal plan for muscle gain","Improve deadlift form","Break a plateau","Recovery after leg day","Best supplements","How many calories?","Cardio or weights first?"].map(q => (
              <button key={q} onClick={() => setInput(q)} style={{padding:"5px 10px",borderRadius:20,border:`1px solid ${C.border2}`,background:C.bgCard2,color:C.textMuted,cursor:"pointer",fontSize:11}}>{q}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function FitForce() {
  const [tab, setTab] = useState("dashboard");
  const [filterMuscle, setFilterMuscle] = useState("All");
  const [filterLevel, setFilterLevel] = useState("All");
  const [profile, setProfile] = useState({name:"Athlete",level:"Beginner",goal:"Muscle Gain",weight:"75",height:"175",age:"25",gender:"Male"});
  const [meals, setMeals] = useState([
    {name:"Oats (100g)",mealTime:"Breakfast",qty:1,cal:389,protein:17,carbs:66,fat:7},
    {name:"Chicken Breast (100g)",mealTime:"Lunch",qty:2,cal:330,protein:62,carbs:0,fat:7.2},
    {name:"Whey Protein (1 scoop)",mealTime:"Post-Workout",qty:1,cal:120,protein:25,carbs:3,fat:2},
  ]);
  const [workoutLog, setWorkoutLog] = useState([
    {date:"Apr 9",name:"Bench Press",sets:3,reps:10,weight:60,vol:1800},
    {date:"Apr 10",name:"Squat",sets:4,reps:8,weight:80,vol:2560},
    {date:"Apr 11",name:"Deadlift",sets:4,reps:5,weight:100,vol:2000},
  ]);
  const [bodyStats, setBodyStats] = useState([{date:"Apr 1",weight:76},{date:"Apr 5",weight:75.5},{date:"Apr 8",weight:75.2},{date:"Apr 10",weight:75},{date:"Apr 12",weight:74.8}]);
  const [prs, setPrs] = useState([{lift:"Bench Press",weight:80},{lift:"Squat",weight:100},{lift:"Deadlift",weight:120},{lift:"OHP",weight:55}]);
  const [supplements, setSupplements] = useState([
    {name:"Creatine",dose:"5g",time:"Post-Workout",done:false},
    {name:"Whey Protein",dose:"1 scoop",time:"Post-Workout",done:true},
    {name:"Vitamin D",dose:"2000 IU",time:"Morning",done:false},
  ]);
  const [water, setWater] = useState(3);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showExDetail, setShowExDetail] = useState(null);
  const [xp, setXp] = useState(1240);
  const [streak] = useState(7);
  const [newBodyStat, setNewBodyStat] = useState("");
  const [measurements, setMeasurements] = useState({chest:"100",waist:"82",hips:"95",bicep:"35",thigh:"55"});
  const [newLogRow, setNewLogRow] = useState({name:"",sets:"",reps:"",weight:""});
  const [orm1W, setOrm1W] = useState("100");
  const [orm1R, setOrm1R] = useState("5");
  const [bfNeck, setBfNeck] = useState("37");
  const [bfWaist, setBfWaist] = useState("82");

  const totalCal = Math.round(meals.reduce((s,m) => s+m.cal, 0));
  const totalProt = Math.round(meals.reduce((s,m) => s+m.protein, 0));
  const totalCarbs = Math.round(meals.reduce((s,m) => s+m.carbs, 0));
  const totalFat = Math.round(meals.reduce((s,m) => s+m.fat, 0));
  const bmi = +((+profile.weight)/((+profile.height/100)**2)).toFixed(1);
  const bmiColor = bmi<18.5?C.blue:bmi<25?C.green:bmi<30?C.yellow:C.red;
  const calGoal = profile.goal==="Fat Loss"?2000:profile.goal==="Muscle Gain"?2800:2400;
  const protGoal = Math.round(+profile.weight*2);
  const level = Math.floor(xp/500)+1;
  const xpToNext = 500-(xp%500);
  const filteredEx = EXERCISES.filter(e => (filterMuscle==="All"||e.muscle===filterMuscle) && (filterLevel==="All"||e.level===filterLevel));

  const card = {background:C.bgCard,border:`1px solid ${C.border2}`,borderRadius:12,padding:"16px",marginBottom:12};
  const h2s = {color:C.text,fontSize:18,fontWeight:500,margin:"0 0 14px"};
  const h3s = {color:C.text,fontSize:15,fontWeight:500,margin:"0 0 8px"};
  const g2 = {display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12,marginBottom:12};
  const navBtn = a => ({background:a?C.red+"22":"transparent",color:a?C.red:C.textMuted,border:"none",borderBottom:`2px solid ${a?C.red:"transparent"}`,padding:"13px 12px",cursor:"pointer",fontSize:12,fontWeight:a?500:400,whiteSpace:"nowrap"});
  const tabs = [{id:"dashboard",label:"Dashboard"},{id:"workouts",label:"Workouts"},{id:"exercises",label:"Exercises"},{id:"nutrition",label:"Nutrition"},{id:"progress",label:"Progress"},{id:"tools",label:"Body Tools"},{id:"ai",label:"AI Coach"},{id:"profile",label:"Profile"}];

  return (
    <div style={{background:C.bg,minHeight:"100vh",color:C.text,fontFamily:"system-ui,sans-serif"}}>
      {activeWorkout && <WorkoutModal plan={activeWorkout} onClose={() => setActiveWorkout(null)} onXp={pts => setXp(p=>p+pts)}/>}
      {showMealModal && <MealModal onAdd={m => { setMeals(p=>[...p,m]); setXp(p=>p+5); }} onClose={() => setShowMealModal(false)}/>}
      {showExDetail && (
        <div style={OL}>
          <div style={{...MOD,maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <h3 style={{color:C.text,margin:0}}>{showExDetail.name}</h3>
              <button onClick={() => setShowExDetail(null)} style={{background:"transparent",border:"none",color:C.textMuted,fontSize:22,cursor:"pointer"}}>×</button>
            </div>
            <div style={{width:"100%",height:140,borderRadius:10,overflow:"hidden",marginBottom:12}} dangerouslySetInnerHTML={{__html:EXERCISE_SVG(showExDetail.muscle)}}/>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
              <Badge label={showExDetail.level} color={showExDetail.level==="Beginner"?C.green:showExDetail.level==="Intermediate"?C.yellow:C.red}/>
              <Tag label={showExDetail.muscle} color={muscleColor[showExDetail.muscle]||C.red}/>
              <Tag label={`${showExDetail.sets}×${showExDetail.reps}`} color={C.blue}/>
              <Tag label={`${showExDetail.rest}s rest`} color={C.yellow}/>
              <Tag label={`~${showExDetail.cal} cal`} color={C.orange}/>
            </div>
            <p style={{color:C.textMuted,fontSize:13,lineHeight:1.7,marginBottom:12}}>{showExDetail.desc}</p>
            <button onClick={() => setShowExDetail(null)} style={{...RBTN,width:"100%"}}>Got it</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{background:C.bgCard,borderBottom:`1px solid #2a1010`,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:34,height:34,background:C.red,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:16}}>F</div>
        <div>
          <div style={{fontWeight:600,fontSize:17}}>FitForce</div>
          <div style={{fontSize:10,color:C.textMuted}}>AI Gym Companion</div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:11,color:C.yellow}}>Lv.{level} · {xp} XP</div>
            <div style={{width:80,height:3,background:C.border,borderRadius:2,overflow:"hidden",marginTop:2}}>
              <div style={{height:"100%",width:`${((xp%500)/500)*100}%`,background:C.yellow,borderRadius:2}}/>
            </div>
          </div>
          <span style={{background:C.red+"22",color:C.red,border:`1px solid ${C.red}33`,borderRadius:6,padding:"4px 10px",fontSize:12}}>🔥 {streak}</span>
        </div>
      </div>
      <div style={{background:C.bgCard,borderBottom:`1px solid ${C.border2}`,padding:"0 12px",display:"flex",gap:2,overflowX:"auto",scrollbarWidth:"none"}}>
        {tabs.map(t => <button key={t.id} style={navBtn(tab===t.id)} onClick={() => setTab(t.id)}>{t.label}</button>)}
      </div>

      <div style={{padding:"16px",maxWidth:"100%",margin:"0 auto"}}>

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <>
            <div style={{marginBottom:14}}>
              <p style={{color:C.textMuted,fontSize:13,margin:"0 0 2px"}}>Welcome back,</p>
              <h2 style={{...h2s,margin:0,fontSize:20}}>{profile.name} 💪</h2>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:10,marginBottom:12}}>
              {[["Calories",totalCal,"kcal",C.red,`/${calGoal}`],["Protein",totalProt+"g","",C.blue,`/${protGoal}g`],["Water",water+" gl","",C.teal,"/8"],["Level","Lv."+level,"",C.yellow,xpToNext+"xp left"]].map(([l,v,u,c,s]) => (
                <div key={l} style={{background:C.bgCard2,border:`1px solid ${C.border2}`,borderRadius:10,padding:"12px",textAlign:"center"}}>
                  <div style={{fontSize:20,fontWeight:600,color:c}}>{v}</div>
                  <div style={{fontSize:10,color:c,marginTop:2}}>{s}</div>
                  <div style={{fontSize:11,color:C.textMuted,marginTop:3}}>{l}</div>
                </div>
              ))}
            </div>
            <div style={g2}>
              <div style={card}>
                <h3 style={h3s}>Quick Start</h3>
                {WORKOUT_PLANS.slice(0,4).map(p => (
                  <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:500}}>{p.name}</div>
                      <div style={{fontSize:11,color:C.textMuted}}>{p.days}d/wk · {p.duration}</div>
                    </div>
                    <button onClick={() => setActiveWorkout(p)} style={{background:p.color+"22",color:p.color,border:`1px solid ${p.color}44`,borderRadius:6,padding:"5px 12px",cursor:"pointer",fontSize:12}}>Start</button>
                  </div>
                ))}
              </div>
              <div style={card}>
                <h3 style={h3s}>Today's Macros</h3>
                <MBar label="Calories" val={totalCal} max={calGoal} color={C.red}/>
                <MBar label="Protein" val={totalProt} max={protGoal} color={C.blue}/>
                <MBar label="Carbs" val={totalCarbs} max={300} color={C.yellow}/>
                <MBar label="Fat" val={totalFat} max={80} color={C.green}/>
                <button onClick={() => setShowMealModal(true)} style={{...RBTN,width:"100%",padding:"9px",marginTop:6}}>+ Log Meal</button>
              </div>
            </div>
            <div style={g2}>
              <WaterTracker water={water} setWater={setWater}/>
              <div style={card}>
                <h3 style={h3s}>Supplements Today</h3>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {supplements.map((s,i) => (
                    <div key={i} onClick={() => setSupplements(p => p.map((sp,j) => j===i?{...sp,done:!sp.done}:sp))} style={{background:s.done?C.green+"20":C.bgCard2,border:`1px solid ${s.done?C.green:C.border}`,borderRadius:10,padding:"10px 12px",cursor:"pointer"}}>
                      <div style={{fontSize:13,color:s.done?C.green:C.text}}>{s.done?"✓ ":""}{s.name}</div>
                      <div style={{fontSize:11,color:C.textMuted}}>{s.dose}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={card}>
              <h3 style={h3s}>Recent Activity</h3>
              {workoutLog.slice(-3).reverse().map((w,i) => (
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
                  <span style={{color:C.textMuted}}>{w.date}</span>
                  <span>{w.name}</span>
                  <span style={{color:C.red}}>{w.sets}×{w.reps} @ {w.weight?w.weight+"kg":"BW"}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* WORKOUTS */}
        {tab === "workouts" && (
          <>
            <h2 style={h2s}>Workout Plans</h2>
            {WORKOUT_PLANS.map(p => (
              <div key={p.id} style={{...card,borderLeft:`3px solid ${p.color}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                      <h3 style={{...h3s,margin:0}}>{p.name}</h3>
                      <Badge label={p.level} color={p.level==="Beginner"?C.green:p.level==="Intermediate"?C.yellow:C.red}/>
                    </div>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:6}}>
                      <Tag label={`${p.days} days/wk`} color={p.color}/>
                      <Tag label={p.duration} color={C.textMuted}/>
                      <Tag label={p.goal} color={p.color}/>
                    </div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {p.exercises.slice(0,5).map(eid => {
                        const ex = EXERCISES.find(e => e.id===eid);
                        return ex ? <span key={eid} style={{fontSize:11,padding:"2px 7px",background:C.bgCard2,borderRadius:6,color:C.textMuted,border:`1px solid ${C.border}`}}>{ex.name}</span> : null;
                      })}
                      {p.exercises.length > 5 && <span style={{fontSize:11,color:C.textMuted}}>+{p.exercises.length-5} more</span>}
                    </div>
                  </div>
                  <button onClick={() => setActiveWorkout(p)} style={{...RBTN,background:p.color,margin:0,padding:"10px 18px",flexShrink:0}}>Start →</button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* EXERCISES */}
        {tab === "exercises" && (
          <>
            <h2 style={h2s}>Exercise Library ({filteredEx.length})</h2>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
              {MUSCLES.map(m => (
                <button key={m} onClick={() => setFilterMuscle(m)} style={{padding:"6px 12px",borderRadius:20,border:`1px solid ${filterMuscle===m?(muscleColor[m]||C.red):C.border}`,background:filterMuscle===m?(muscleColor[m]||C.red)+"20":"transparent",color:filterMuscle===m?(muscleColor[m]||C.red):C.textMuted,cursor:"pointer",fontSize:12}}>{m}</button>
              ))}
            </div>
            <div style={{display:"flex",gap:6,marginBottom:14}}>
              {["All","Beginner","Intermediate","Advanced"].map(l => (
                <button key={l} onClick={() => setFilterLevel(l)} style={{padding:"5px 12px",borderRadius:6,border:`1px solid ${filterLevel===l?C.red:C.border}`,background:filterLevel===l?C.red+"20":"transparent",color:filterLevel===l?C.red:C.textMuted,cursor:"pointer",fontSize:12}}>{l}</button>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
              {filteredEx.map(ex => (
                <div key={ex.id} style={{...card,marginBottom:0,cursor:"pointer"}} onClick={() => setShowExDetail(ex)}>
                  <div style={{width:"100%",height:80,borderRadius:8,overflow:"hidden",marginBottom:10}} dangerouslySetInnerHTML={{__html:EXERCISE_SVG(ex.muscle)}}/>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <h3 style={{...h3s,margin:0,fontSize:13}}>{ex.name}</h3>
                    <Badge label={ex.level} color={ex.level==="Beginner"?C.green:ex.level==="Intermediate"?C.yellow:C.red}/>
                  </div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:4}}>
                    <Tag label={ex.muscle} color={muscleColor[ex.muscle]||C.red}/>
                    <Tag label={`${ex.sets}×${ex.reps}`} color={C.blue}/>
                  </div>
                  <p style={{color:C.textMuted,fontSize:11,margin:0,lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{ex.desc}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* NUTRITION */}
        {tab === "nutrition" && (
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <h2 style={{...h2s,margin:0}}>Nutrition</h2>
              <button onClick={() => setShowMealModal(true)} style={RBTN}>+ Add Meal</button>
            </div>
            <div style={card}>
              <h3 style={h3s}>Daily Summary</h3>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))",gap:10,marginBottom:10}}>
                {[["Calories",totalCal,calGoal,"kcal",C.red],["Protein",totalProt,protGoal,"g",C.blue],["Carbs",totalCarbs,300,"g",C.yellow],["Fat",totalFat,80,"g",C.green]].map(([l,v,g,u,col]) => (
                  <div key={l} style={{textAlign:"center",background:C.bgCard2,borderRadius:10,padding:"12px 6px"}}>
                    <div style={{fontSize:20,fontWeight:600,color:col}}>{v}</div>
                    <div style={{fontSize:10,color:C.textMuted}}>/{g}{u}</div>
                    <div style={{height:3,background:C.border,borderRadius:2,margin:"6px 4px 4px",overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${Math.min(100,(v/g)*100)}%`,background:col,borderRadius:2}}/>
                    </div>
                    <div style={{fontSize:11,color:C.textMuted}}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{fontSize:12,color:C.textMuted,textAlign:"center"}}>
                Remaining: <span style={{color:C.green}}>{Math.max(0,calGoal-totalCal)} kcal</span> · Protein gap: <span style={{color:C.blue}}>{Math.max(0,protGoal-totalProt)}g</span>
              </div>
            </div>
            <WaterTracker water={water} setWater={setWater}/>
            <div style={card}>
              <h3 style={h3s}>Supplements</h3>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {supplements.map((s,i) => (
                  <div key={i} onClick={() => setSupplements(p => p.map((sp,j) => j===i?{...sp,done:!sp.done}:sp))} style={{background:s.done?C.green+"20":C.bgCard2,border:`1px solid ${s.done?C.green:C.border}`,borderRadius:10,padding:"10px 12px",cursor:"pointer"}}>
                    <div style={{fontSize:13,color:s.done?C.green:C.text}}>{s.done?"✓ ":""}{s.name}</div>
                    <div style={{fontSize:11,color:C.textMuted}}>{s.dose} · {s.time}</div>
                  </div>
                ))}
                <div onClick={() => { const n = prompt("Supplement name:"); if(n) setSupplements(p=>[...p,{name:n,dose:"1 serving",time:"Daily",done:false}]); }} style={{background:C.bgCard2,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",minWidth:50}}>
                  <span style={{color:C.textMuted,fontSize:22}}>+</span>
                </div>
              </div>
            </div>
            {["Breakfast","Lunch","Post-Workout","Dinner","Snack"].map(mt => {
              const mts = meals.filter(m => m.mealTime===mt);
              if (!mts.length) return null;
              return (
                <div key={mt} style={card}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <h3 style={{...h3s,margin:0}}>{mt}</h3>
                    <div style={{fontSize:12,color:C.textMuted}}>{Math.round(mts.reduce((s,m)=>s+m.cal,0))} kcal · {Math.round(mts.reduce((s,m)=>s+m.protein,0))}g P</div>
                  </div>
                  {mts.map((m,i) => (
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
                      <div>
                        <div style={{fontSize:13}}>{m.name}{m.qty&&m.qty!==1?<span style={{color:C.textMuted}}> ×{m.qty}</span>:""}</div>
                        <div style={{fontSize:11,color:C.textMuted}}>{Math.round(m.protein)}g P · {Math.round(m.carbs)}g C · {Math.round(m.fat)}g F</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{color:C.red,fontSize:13,fontWeight:500}}>{Math.round(m.cal)} kcal</span>
                        <button onClick={() => setMeals(p => p.filter(x => x!==m))} style={{background:"transparent",border:"none",color:C.textDim,cursor:"pointer",fontSize:18}}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </>
        )}

        {/* PROGRESS */}
        {tab === "progress" && (
          <>
            <h2 style={h2s}>Progress</h2>
            <div style={g2}>
              <div style={card}>
                <h3 style={h3s}>Body Weight</h3>
                <MiniChart data={bodyStats.map(b => ({...b,value:b.weight}))} color={C.red} label="Weight trend (kg)"/>
                <div style={{display:"flex",gap:8}}>
                  <input type="number" step="0.1" placeholder="Weight (kg)" value={newBodyStat} onChange={e => setNewBodyStat(e.target.value)} style={{...INP,flex:1,padding:"8px 10px",fontSize:12}}/>
                  <button onClick={() => {
                    if (!newBodyStat) return;
                    const today = new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"});
                    setBodyStats(p => [...p,{date:today,weight:+newBodyStat}]);
                    setNewBodyStat("");
                  }} style={{...RBTN,margin:0,padding:"8px 14px"}}>Log</button>
                </div>
              </div>
              <div style={card}>
                <h3 style={h3s}>Strength PRs</h3>
                {prs.map((p,i) => (
                  <div key={i} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:13}}>{p.lift}</span>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <input type="number" value={p.weight} onChange={e => setPrs(ps => ps.map((pr,j) => j===i?{...pr,weight:+e.target.value}:pr))} style={{...INP,width:65,padding:"4px 8px",fontSize:12,textAlign:"center"}}/>
                        <span style={{fontSize:11,color:C.textMuted}}>kg</span>
                      </div>
                    </div>
                    <div style={{height:4,background:C.border,borderRadius:2,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${Math.min(100,(p.weight/160)*100)}%`,background:C.red,borderRadius:2}}/>
                    </div>
                  </div>
                ))}
                <button onClick={() => { const n=prompt("Lift name:"); if(n) setPrs(p=>[...p,{lift:n,weight:60}]); }} style={{background:C.bgCard2,border:`1px solid ${C.border}`,color:C.textMuted,borderRadius:8,padding:"7px",cursor:"pointer",fontSize:12,width:"100%",marginTop:4}}>+ Add Lift</button>
              </div>
            </div>
            <div style={card}>
              <h3 style={h3s}>Body Measurements (cm)</h3>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:10}}>
                {Object.entries(measurements).map(([k,v]) => (
                  <div key={k}>
                    <label style={{fontSize:11,color:C.textMuted,display:"block",marginBottom:4,textTransform:"capitalize"}}>{k}</label>
                    <input type="number" value={v} onChange={e => setMeasurements(p=>({...p,[k]:e.target.value}))} style={{...INP,padding:"8px 10px",fontSize:13}}/>
                  </div>
                ))}
              </div>
            </div>
            <div style={card}>
              <h3 style={h3s}>Workout Log</h3>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:400}}>
                  <thead>
                    <tr style={{borderBottom:`1px solid ${C.border2}`}}>
                      {["Date","Exercise","Sets","Reps","Weight","Volume"].map(h => <th key={h} style={{padding:"8px 6px",textAlign:"left",color:C.textMuted,fontWeight:400}}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {workoutLog.map((w,i) => (
                      <tr key={i} style={{borderBottom:`1px solid ${C.border}`}}>
                        <td style={{padding:"7px 6px",color:C.textMuted}}>{w.date}</td>
                        <td style={{padding:"7px 6px"}}>{w.name}</td>
                        <td style={{padding:"7px 6px",color:C.red}}>{w.sets}</td>
                        <td style={{padding:"7px 6px",color:C.blue}}>{w.reps}</td>
                        <td style={{padding:"7px 6px",color:C.yellow}}>{w.weight?`${w.weight}kg`:"BW"}</td>
                        <td style={{padding:"7px 6px",color:C.textMuted}}>{w.vol||"—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:8,marginTop:12}}>
                {[["Exercise","name","text"],["Sets","sets","number"],["Reps","reps","number"],["Weight","weight","number"]].map(([ph,k,t]) => (
                  <input key={k} type={t} placeholder={ph} value={newLogRow[k]} onChange={e => setNewLogRow(p=>({...p,[k]:e.target.value}))} style={{...INP,padding:"8px 10px",fontSize:12}}/>
                ))}
              </div>
              <button style={{...RBTN,width:"100%",marginTop:8}} onClick={() => {
                if (!newLogRow.name) return;
                const s=+newLogRow.sets||3, r=+newLogRow.reps||10, w=+newLogRow.weight||0;
                setWorkoutLog(p => [...p,{date:"Today",name:newLogRow.name,sets:s,reps:r,weight:w,vol:s*r*w}]);
                setNewLogRow({name:"",sets:"",reps:"",weight:""});
                setXp(p => p+15);
              }}>+ Log Exercise</button>
            </div>
            <div style={card}>
              <h3 style={h3s}>Achievements & XP</h3>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div>
                  <div style={{fontSize:22,fontWeight:600,color:C.yellow}}>Level {level}</div>
                  <div style={{fontSize:12,color:C.textMuted}}>{xp} XP total</div>
                </div>
                <div>
                  <div style={{fontSize:12,color:C.text,marginBottom:4}}>{xpToNext} XP to Level {level+1}</div>
                  <div style={{width:120,height:6,background:C.border,borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${((xp%500)/500)*100}%`,background:C.yellow,borderRadius:3}}/>
                  </div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(90px,1fr))",gap:8}}>
                {[["🔥","7-Day Streak",C.red,true],["💪","First Workout",C.blue,true],["🥗","Nutrition Pro",C.green,true],["⚡","PR Broken",C.yellow,true],["🏃","Cardio King",C.purple,false],["🎯","Level 5",C.orange,false]].map(([icon,name,c,unlocked]) => (
                  <div key={name} style={{background:unlocked?c+"15":C.bgCard2,border:`1px solid ${unlocked?c+"33":C.border}`,borderRadius:10,padding:"10px 8px",textAlign:"center",opacity:unlocked?1:0.35}}>
                    <div style={{fontSize:22,marginBottom:4}}>{icon}</div>
                    <div style={{fontSize:10,color:unlocked?c:C.textMuted,lineHeight:1.3}}>{name}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* BODY TOOLS */}
        {tab === "tools" && (
          <>
            <h2 style={h2s}>Body Tools</h2>
            <div style={g2}>
              <div style={card}>
                <h3 style={h3s}>BMI & Metabolism</h3>
                {(() => {
                  const h = +profile.height/100, w = +profile.weight, age = +profile.age||25;
                  const bmi2 = +(w/(h*h)).toFixed(1);
                  const bmr = profile.gender==="Female" ? (10*w)+(6.25*(+profile.height))-(5*age)-161 : (10*w)+(6.25*(+profile.height))-(5*age)+5;
                  const tdee = Math.round(bmr*1.55);
                  const bmiC = bmi2<18.5?C.blue:bmi2<25?C.green:bmi2<30?C.yellow:C.red;
                  const bmiL = bmi2<18.5?"Underweight":bmi2<25?"Normal":bmi2<30?"Overweight":"Obese";
                  return (
                    <>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10}}>
                        {[["BMI",bmi2,bmiC,bmiL],["BMR",Math.round(bmr),C.blue,"kcal/day"],["TDEE",tdee,C.red,"kcal/day"]].map(([l,v,c,sub]) => (
                          <div key={l} style={{textAlign:"center",background:C.bgCard2,borderRadius:8,padding:"10px 4px"}}>
                            <div style={{fontSize:18,fontWeight:600,color:c}}>{v}</div>
                            <div style={{fontSize:10,color:C.textMuted}}>{l}</div>
                            <div style={{fontSize:10,color:c}}>{sub}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{background:C.bgCard2,borderRadius:8,padding:"10px",fontSize:12}}>
                        <div style={{color:C.textMuted,marginBottom:4}}>Calorie goal: <span style={{color:C.red}}>{calGoal} kcal</span></div>
                        <div style={{color:C.textMuted,marginBottom:4}}>Protein target: <span style={{color:C.blue}}>{protGoal}g/day</span></div>
                        <div style={{color:C.textMuted}}>Today's balance: <span style={{color:totalCal>calGoal?C.orange:C.green}}>{totalCal-calGoal>0?"+":""}{totalCal-calGoal} kcal</span></div>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div style={card}>
                <h3 style={h3s}>1 Rep Max Calculator</h3>
                {(() => {
                  const oneRM = Math.round(+orm1W*(1+0.0333*+orm1R));
                  return (
                    <>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                        <div>
                          <label style={{fontSize:11,color:C.textMuted,display:"block",marginBottom:3}}>Weight lifted (kg)</label>
                          <input type="number" value={orm1W} onChange={e => setOrm1W(e.target.value)} style={{...INP,padding:"8px 10px",fontSize:13}}/>
                        </div>
                        <div>
                          <label style={{fontSize:11,color:C.textMuted,display:"block",marginBottom:3}}>Reps completed</label>
                          <input type="number" value={orm1R} onChange={e => setOrm1R(e.target.value)} style={{...INP,padding:"8px 10px",fontSize:13}}/>
                        </div>
                      </div>
                      <div style={{textAlign:"center",background:C.bgCard2,borderRadius:10,padding:"14px",marginBottom:10}}>
                        <div style={{fontSize:28,fontWeight:700,color:C.red}}>{oneRM} kg</div>
                        <div style={{fontSize:12,color:C.textMuted}}>Estimated 1RM</div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
                        {[["95%",Math.round(oneRM*0.95),"Strength"],["85%",Math.round(oneRM*0.85),"Power"],["75%",Math.round(oneRM*0.75),"Hypertrophy"],["65%",Math.round(oneRM*0.65),"Endurance"]].map(([p,v,l]) => (
                          <div key={p} style={{background:C.bgCard3,borderRadius:8,padding:"8px 4px",textAlign:"center"}}>
                            <div style={{fontSize:14,color:C.red,fontWeight:500}}>{v}kg</div>
                            <div style={{fontSize:10,color:C.textMuted}}>{p}</div>
                            <div style={{fontSize:9,color:C.textDim}}>{l}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
            <div style={g2}>
              <div style={card}>
                <h3 style={h3s}>Body Fat Estimator (Navy)</h3>
                {(() => {
                  const bf = +(495/(1.0324-0.19077*Math.log10(Math.max(1,+bfWaist-+bfNeck))+0.15456*Math.log10(+profile.height))-450).toFixed(1);
                  const bfLabel = bf<8?"Essential":bf<14?"Athletic":bf<18?"Fitness":bf<24?"Average":"High";
                  const bfColor = bf<14?C.blue:bf<18?C.green:bf<24?C.yellow:C.red;
                  return (
                    <>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                        <div>
                          <label style={{fontSize:11,color:C.textMuted,display:"block",marginBottom:3}}>Neck (cm)</label>
                          <input type="number" value={bfNeck} onChange={e => setBfNeck(e.target.value)} style={{...INP,padding:"8px 10px"}}/>
                        </div>
                        <div>
                          <label style={{fontSize:11,color:C.textMuted,display:"block",marginBottom:3}}>Waist (cm)</label>
                          <input type="number" value={bfWaist} onChange={e => setBfWaist(e.target.value)} style={{...INP,padding:"8px 10px"}}/>
                        </div>
                      </div>
                      <div style={{textAlign:"center",background:C.bgCard2,borderRadius:10,padding:"14px"}}>
                        <div style={{fontSize:28,fontWeight:700,color:bfColor}}>{isNaN(bf)||bf<0?"-":bf}%</div>
                        <div style={{fontSize:13,color:bfColor}}>{bfLabel}</div>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div style={card}>
                <h3 style={h3s}>Recovery Guide</h3>
                {[["Chest/Triceps","48-72h",C.red],["Back/Biceps","48-72h",C.blue],["Legs","72-96h",C.green],["Shoulders","48-72h",C.yellow],["Core","24-48h",C.orange],["Cardio","24h",C.teal]].map(([m,t,c]) => (
                  <div key={m} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
                    <span>{m}</span>
                    <span style={{color:c,fontSize:12}}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* AI COACH */}
        {tab === "ai" && (
          <>
            <h2 style={h2s}>AI Coach</h2>
            <AICoach profile={profile} totalCal={totalCal} totalProt={totalProt} water={water} level={level} xp={xp}/>
          </>
        )}

        {/* PROFILE */}
        {tab === "profile" && (
          <>
            <h2 style={h2s}>Profile</h2>
            <div style={card}>
              <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:18,paddingBottom:16,borderBottom:`1px solid ${C.border}`}}>
                <div style={{width:64,height:64,background:C.red,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:700}}>{profile.name.charAt(0).toUpperCase()}</div>
                <div>
                  <div style={{fontWeight:600,fontSize:18}}>{profile.name}</div>
                  <div style={{color:C.textMuted,fontSize:13,marginTop:2}}>{profile.level} · {profile.goal}</div>
                  <div style={{display:"flex",gap:8,marginTop:4}}>
                    <span style={{fontSize:12,color:C.yellow}}>Lv.{level}</span>
                    <span style={{fontSize:12,color:bmiColor}}>BMI: {bmi}</span>
                    <span style={{fontSize:12,color:C.red}}>🔥 {streak}</span>
                  </div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                {[["Name","name","text"],["Age","age","number"],["Weight (kg)","weight","number"],["Height (cm)","height","number"]].map(([l,k,t]) => (
                  <div key={k}>
                    <label style={{fontSize:12,color:C.textMuted,display:"block",marginBottom:4}}>{l}</label>
                    <input type={t} value={profile[k]} onChange={e => setProfile(p=>({...p,[k]:e.target.value}))} style={INP}/>
                  </div>
                ))}
              </div>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:12,color:C.textMuted,display:"block",marginBottom:6}}>Gender</label>
                <div style={{display:"flex",gap:8}}>
                  {["Male","Female","Other"].map(g => (
                    <button key={g} onClick={() => setProfile(p=>({...p,gender:g}))} style={{flex:1,padding:"8px",borderRadius:8,border:`1px solid ${profile.gender===g?C.red:C.border}`,background:profile.gender===g?C.red+"20":"transparent",color:profile.gender===g?C.red:C.textMuted,cursor:"pointer",fontSize:13}}>{g}</button>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:12,color:C.textMuted,display:"block",marginBottom:6}}>Fitness Level</label>
                <div style={{display:"flex",gap:8}}>
                  {["Beginner","Intermediate","Advanced"].map(l => (
                    <button key={l} onClick={() => setProfile(p=>({...p,level:l}))} style={{flex:1,padding:"8px",borderRadius:8,border:`1px solid ${profile.level===l?C.red:C.border}`,background:profile.level===l?C.red+"20":"transparent",color:profile.level===l?C.red:C.textMuted,cursor:"pointer",fontSize:13}}>{l}</button>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:16}}>
                <label style={{fontSize:12,color:C.textMuted,display:"block",marginBottom:6}}>Goal</label>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {["Muscle Gain","Fat Loss","Endurance","Strength","General Fitness"].map(g => (
                    <button key={g} onClick={() => setProfile(p=>({...p,goal:g}))} style={{padding:"7px 14px",borderRadius:20,border:`1px solid ${profile.goal===g?C.red:C.border}`,background:profile.goal===g?C.red+"20":"transparent",color:profile.goal===g?C.red:C.textMuted,cursor:"pointer",fontSize:12}}>{g}</button>
                  ))}
                </div>
              </div>
              <div style={{background:C.bgCard2,borderRadius:10,padding:"12px",marginBottom:12,fontSize:12}}>
                <div style={{color:C.textMuted,marginBottom:6}}>Auto-calculated targets</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  <div style={{color:C.textMuted}}>Calories: <span style={{color:C.red}}>{calGoal} kcal</span></div>
                  <div style={{color:C.textMuted}}>Protein: <span style={{color:C.blue}}>{protGoal}g</span></div>
                  <div style={{color:C.textMuted}}>BMI: <span style={{color:bmiColor}}>{bmi}</span></div>
                  <div style={{color:C.textMuted}}>Goal: <span style={{color:C.yellow}}>{profile.goal}</span></div>
                </div>
              </div>
              <button style={{...RBTN,width:"100%"}}>Save Profile</button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

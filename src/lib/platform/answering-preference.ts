export const ANSWERING_PREFERENCES={
 undecided:{label:'Help me choose',description:'We’ll talk through your workflow during setup.'},
 always:{label:'AI answers first, any time',description:'During opening hours and after closing, let AI take the first call.'},
 after_hours:{label:'AI only after hours',description:'Your team handles calls while open. AI helps when you’re closed.'},
 backup:{label:'AI when my team cannot answer',description:'Ring your team first while open, then offer AI help if unanswered. We’ll confirm the after-hours behavior with you.'},
 choice:{label:'Let callers choose AI or my team',description:'Offer a choice to callers. We’ll agree what happens when staff are unavailable.'},
 confirmations:{label:'Confirmation calls only',description:'Use AI for outgoing appointment confirmations. Keep incoming calls with your team.'},
 no_ai:{label:'No AI calls for now',description:'Start with online booking. Keep incoming and confirmation calls with your team.'},
} as const;
export type AnsweringPreference=keyof typeof ANSWERING_PREFERENCES;

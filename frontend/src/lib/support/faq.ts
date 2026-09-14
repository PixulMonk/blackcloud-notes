export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqSection {
  category: string;
  items: FaqItem[];
}

export const faqSections: FaqSection[] = [
  {
    category: "Your Data",
    items: [
      {
        q: "Can you recover my password?",
        a: "No. Your password unlocks the key that protects your notes, and we never see it. If you lose it, your notes can't be recovered — there's no backend override.",
      },
      {
        q: "What happens if I forget my password?",
        a: "Your notes stay encrypted and inaccessible. We can't reset your password in a way that restores access to existing notes, since we never store anything that could unlock them.",
      },
      {
        q: "How is my data protected?",
        a: "Your notes are encrypted on your device before they're sent anywhere. What reaches our servers is unreadable without your password.",
      },
    ],
  },
  {
    category: "Notes & Organization",
    items: [
      {
        q: "What happens when I delete a note?",
        a: "Deleted notes go to Trash, where they stay for 30 days before being permanently removed. You can restore them anytime before then.",
      },
      {
        q: "What's the difference between Archive and Trash?",
        a: "Archive hides a note from your sidebar without marking it for deletion — good for notes you're done with but want to keep. Trash is for notes you intend to remove.",
      },
      {
        q: "Can I restore a deleted note?",
        a: "Yes, as long as it's still in Trash. Permanently deleted notes can't be recovered.",
      },
    ],
  },
  {
    category: "Access & Devices",
    items: [
      {
        q: "Can I use BlackCloud on multiple devices?",
        a: "Yes — sign in with your account and password on any device to access your notes.",
      },
      {
        q: "What happens if I lose my device but remember my password?",
        a: "You're fine — sign in on a new device with your existing password and your notes will be accessible again.",
      },
      {
        q: "Does BlackCloud work offline?",
        a: "Not yet — an internet connection is currently required.",
      },
    ],
  },
  {
    category: "Support",
    items: [
      {
        q: "If you can't read my notes, how can you help with support issues?",
        a: "We can help with account access, billing, and bugs — anything that doesn't require seeing inside a specific note. We just can't view or recover note content itself.",
      },
    ],
  },
];

export default faqSections;

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
    category: "Privacy & Security",
    items: [
      {
        q: "Can BlackCloud read my notes?",
        a: "No. Your notes are encrypted on your device before they're sent to our servers. BlackCloud does not have access to the encryption keys needed to decrypt your notes, so we cannot read their contents.",
      },
      {
        q: "How is my data protected?",
        a: "Your notes are encrypted on your device before they leave it. They remain encrypted while stored on our servers and can only be decrypted locally when you unlock your vault.",
      },
      {
        q: "Are my notes end-to-end encrypted?",
        a: "Yes. Notes are encrypted on your device before they are transmitted to BlackCloud. They remain encrypted while stored on our servers and are only decrypted locally when you unlock your vault.",
      },
      {
        q: "Is my password sent to BlackCloud?",
        a: "No. Your master password is processed locally on your device to derive the cryptographic keys needed to unlock your vault. BlackCloud does not receive or store your master password.",
      },
      {
        q: "What does 'zero-knowledge' mean?",
        a: "It means your note contents are encrypted before they reach our servers, and we don't have the keys required to decrypt them. BlackCloud can store and synchronize your encrypted data, but we cannot read the contents of your notes.",
      },
      {
        q: "What happens if BlackCloud's servers or database are compromised?",
        a: "Your note contents remain encrypted. Because encryption and decryption happen on your device and the server does not have the keys needed to decrypt your notes, a database breach does not give an attacker direct access to your plaintext notes. However, no online service can guarantee protection against every type of attack.",
      },
      {
        q: "What information can BlackCloud see?",
        a: "While your note contents are encrypted, some metadata is not. This may include information such as timestamps, note sizes, and other account or system information required to operate the service. We cannot read the actual contents of your encrypted notes.",
      },
      {
        q: "Is my data safe if my device is compromised?",
        a: "Our zero-knowledge design protects your notes from server-side breaches. However, because decryption happens on your device, your security ultimately depends on keeping your local environment safe from malware, malicious browser extensions, or other attacks that compromise your browser.",
      },
      {
        q: "Has BlackCloud undergone a security audit?",
        a: "Not yet. BlackCloud is currently an early-stage MVP and has not undergone a formal independent security audit. While we've designed the system around strong privacy and encryption principles, we recommend avoiding highly sensitive information until the project has undergone further security validation.",
      },
    ],
  },

  {
    category: "Passwords & Account Recovery",
    items: [
      {
        q: "What happens if I forget my password?",
        a: "We can't recover your password or restore access to your existing notes. Your password is used to derive the keys that protect your vault, and we don't have a copy of those keys.",
      },
      {
        q: "What happens if I use the 'Forgot Password' recovery option?",
        a: "Because we never see or store your password, resetting a forgotten password requires generating a brand-new encryption vault. Your old encrypted notes can no longer be decrypted and will be permanently deleted from our servers. You will be warned about this before proceeding.",
      },
      {
        q: "What happens when I change my password?",
        a: "Your notes don't need to be re-encrypted individually. Your existing encryption key is protected with a new key derived from your new password, allowing your vault to remain intact while your password changes.",
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
      {
        q: "Why do I have to re-enter my password after refreshing the page?",
        a: "For your security, your decryption key lives exclusively in your browser's temporary memory. Refreshing the page clears it out, automatically locking your vault so no one else can access it.",
      },
    ],
  },

  {
    category: "Support",
    items: [
      {
        q: "If you can't read my notes, how can you help with support issues?",
        a: "We can help with things like login issues, account settings, billing, and bugs. We can troubleshoot problems with your account and the app, but we can't view, decrypt, or recover the contents of your notes.",
      },
    ],
  },
];

export default faqSections;

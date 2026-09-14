import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import faqSections from "@/lib/support/faq";

function SupportPage() {
  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto py-8">
      <h1 className="text-lg font-semibold mb-1">Help & Support</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Answers to common questions, or reach out below.
      </p>

      <div className="flex flex-col gap-8 mb-12">
        {faqSections.map((section) => (
          <div key={section.category}>
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              {section.category}
            </h2>
            <Accordion type="single" collapsible>
              {section.items.map((item, i) => (
                <AccordionItem key={i} value={`${section.category}-${i}`}>
                  <AccordionTrigger className="text-sm text-left">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-8">
        <h2 className="text-sm font-semibold mb-1">Still need help?</h2>
        <p className="text-xs text-muted-foreground mb-6">
          Send us a message and we'll get back to you.
        </p>

        <form className="flex flex-col gap-4">
          <div>
            <Label htmlFor="contact-email">Email</Label>
            <Input id="contact-email" type="email" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="contact-subject">Subject</Label>
            <Input id="contact-subject" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="contact-message">Message</Label>
            <Textarea id="contact-message" rows={5} className="mt-1.5" />
          </div>
          <Button type="submit" className="self-start">
            Send message
          </Button>
        </form>
      </div>
    </div>
  );
}

export default SupportPage;

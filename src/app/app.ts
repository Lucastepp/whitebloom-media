import { ChangeDetectorRef, Component, inject } from '@angular/core';

interface FinderOption {
  label: string;
  detail: string;
  value: string;
}

interface FinderStep {
  eyebrow: string;
  title: string;
  intro: string;
  options: FinderOption[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly cdr = inject(ChangeDetectorRef);

  readonly finderSteps: FinderStep[] = [
    {
      eyebrow: 'Question 01',
      title: 'Who is the content for?',
      intro: 'Start with the kind of client or event owner. The coverage plan changes when the goal is venue marketing, a private celebration or an ongoing event calendar.',
      options: [
        {
          label: 'Venue or event space',
          detail: 'The place needs reels, atmosphere, rooms, food, details and seasonal content.',
          value: 'venue',
        },
        {
          label: 'Private host or couple',
          detail: 'One event needs a polished recap, emotional moments and usable social edits.',
          value: 'private',
        },
        {
          label: 'Event company',
          detail: 'A team needs repeatable content across one or multiple event dates.',
          value: 'company',
        },
        {
          label: 'Band, DJ or brand',
          detail: 'The focus is performance, crowd reaction, launch energy or social proof.',
          value: 'performance',
        },
      ],
    },
    {
      eyebrow: 'Question 02',
      title: 'What are we filming?',
      intro: 'Pick the closest starting point. A final package can combine venue, guests, food, live performance and brand material.',
      options: [
        {
          label: 'Venue atmosphere',
          detail: 'Rooms, entrance, tables, food, light, arrival and the feeling of the place.',
          value: 'venue-atmosphere',
        },
        {
          label: 'Wedding or celebration',
          detail: 'A wider event story with people, music, speeches, details and recap moments.',
          value: 'celebration',
        },
        {
          label: 'Live performance',
          detail: 'Band, DJ, crowd emotion, singalong, movement and the room reacting.',
          value: 'live-performance',
        },
        {
          label: 'Social media content day',
          detail: 'A planned shoot for reels, photos, drone, branding and ongoing posts.',
          value: 'content-day',
        },
      ],
    },
    {
      eyebrow: 'Question 03',
      title: 'How often do you need content?',
      intro: 'This helps separate one-off coverage from recurring work for venues, event companies and brands.',
      options: [
        {
          label: 'One confirmed event',
          detail: 'One date, one location and a focused set of deliverables.',
          value: 'one-date',
        },
        {
          label: 'Multiple event dates',
          detail: 'A run of events that needs a consistent content system.',
          value: 'multiple-dates',
        },
        {
          label: 'Ongoing monthly content',
          detail: 'Regular reels, photo, social media planning and campaign material.',
          value: 'ongoing',
        },
        {
          label: 'Not sure yet',
          detail: 'You know the goal, but the scope and rhythm still need shaping.',
          value: 'unsure',
        },
      ],
    },
  ];

  finderStepIndex = 0;
  finderSelections: Record<number, FinderOption> = {};
  messageDraft = '';
  formStatus = '';
  formError = false;
  formSending = false;
  private submittedForm?: HTMLFormElement;
  private deliveryForm?: HTMLFormElement;
  private formFallbackTimeout?: number;

  get finderComplete(): boolean {
    return this.finderStepIndex === this.finderSteps.length;
  }

  get activeFinderStep(): FinderStep {
    return this.finderSteps[Math.min(this.finderStepIndex, this.finderSteps.length - 1)];
  }

  get finderProgress(): number {
    return this.finderComplete ? 100 : Math.round(((this.finderStepIndex + 1) / this.finderSteps.length) * 100);
  }

  get finderRecommendation(): { title: string; text: string; support: string[]; draft: string } {
    const client = this.finderSelections[0];
    const content = this.finderSelections[1];
    const rhythm = this.finderSelections[2];

    const clientText: Record<string, string> = {
      venue: 'a venue or event space',
      private: 'a private host or couple',
      company: 'an event company',
      performance: 'a band, DJ or brand',
    };

    const contentText: Record<string, string> = {
      'venue-atmosphere': 'venue atmosphere content',
      celebration: 'wedding or celebration coverage',
      'live-performance': 'live performance content',
      'content-day': 'a social media content day',
    };

    const rhythmText: Record<string, string> = {
      'one-date': 'one confirmed event date',
      'multiple-dates': 'multiple event dates',
      ongoing: 'ongoing monthly content',
      unsure: 'a scope that still needs shaping',
    };

    const support = new Set<string>();
    if (content?.value === 'venue-atmosphere') support.add('Venue reels, details and atmosphere');
    if (content?.value === 'celebration') support.add('Event recap and guest moments');
    if (content?.value === 'live-performance') support.add('Band, DJ and crowd emotion');
    if (content?.value === 'content-day') support.add('Photo, video, drone and social planning');
    if (rhythm?.value === 'multiple-dates') support.add('Repeatable coverage plan');
    if (rhythm?.value === 'ongoing') support.add('Monthly social media rhythm');

    const title =
      rhythm?.value === 'ongoing'
        ? 'Start with an ongoing content plan.'
        : rhythm?.value === 'multiple-dates'
          ? 'Start with a multi-date event plan.'
          : content?.value === 'live-performance'
            ? 'Start with performance-first coverage.'
            : 'Start with a focused event brief.';

    const text = `A good first brief is ${contentText[content?.value ?? ''] ?? 'event content'} for ${
      clientText[client?.value ?? ''] ?? 'your team'
    }, shaped around ${rhythmText[rhythm?.value ?? ''] ?? 'the dates and locations available'}.`;

    const draft = `Hello White Bloom Media,

I'm interested in ${contentText[content?.value ?? ''] ?? 'event content'}.

Client type: ${client?.label ?? 'Not selected'}
Content focus: ${content?.label ?? 'Not selected'}
Schedule: ${rhythm?.label ?? 'Not selected'}

Useful starting point:
${title}
${text}

Event date(s):
Location / venue:
What we need:`;

    return { title, text, support: [...support], draft };
  }

  chooseFinderOption(option: FinderOption): void {
    this.finderSelections[this.finderStepIndex] = option;
    this.finderStepIndex = Math.min(this.finderStepIndex + 1, this.finderSteps.length);
  }

  backFinder(): void {
    this.finderStepIndex = Math.max(this.finderStepIndex - 1, 0);
  }

  restartFinder(): void {
    this.finderSelections = {};
    this.finderStepIndex = 0;
    this.messageDraft = '';
  }

  useFinderBrief(): void {
    this.messageDraft = this.finderRecommendation.draft;
  }

  submitProject(event: SubmitEvent): void {
    event.preventDefault();

    const form = event.currentTarget as HTMLFormElement;
    this.formStatus = '';
    this.formError = false;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const deliveryForm = document.createElement('form');
    deliveryForm.action = 'https://formsubmit.co/hello@whitebloom.media';
    deliveryForm.method = 'POST';
    deliveryForm.target = 'contact-submit-frame';
    deliveryForm.style.display = 'none';

    formData.forEach((value, key) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = String(value);
      deliveryForm.appendChild(input);
    });

    document.body.appendChild(deliveryForm);
    this.deliveryForm = deliveryForm;
    this.submittedForm = form;
    this.formSending = true;
    this.formFallbackTimeout = window.setTimeout(() => this.finishFormSubmit(), 4500);
    deliveryForm.submit();
  }

  handleFormFrameLoad(): void {
    if (!this.formSending) {
      return;
    }

    window.setTimeout(() => this.finishFormSubmit(), 450);
  }

  private finishFormSubmit(): void {
    if (!this.formSending) {
      return;
    }

    if (this.formFallbackTimeout) {
      window.clearTimeout(this.formFallbackTimeout);
      this.formFallbackTimeout = undefined;
    }

    this.submittedForm?.reset();
    this.deliveryForm?.remove();
    this.messageDraft = '';
    this.formSending = false;
    this.formStatus = 'Thanks. Your project details were sent to White Bloom Media.';
    this.submittedForm = undefined;
    this.deliveryForm = undefined;
    this.cdr.detectChanges();
  }
}

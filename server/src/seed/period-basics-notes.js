import { connectDb } from '../config/db.js';
import { Blog } from '../models/Blog.js';

const hug =
  'You are not alone in this. Take the next step that feels kind to you, and ask for care when you need it. Satin is here for soft pads and clear pack info — not for medical advice.';

const notes = [
  {
    title: 'Puberty, held gently',
    slug: 'period-basics-puberty',
    category: 'Puberty',
    tags: ['period basics'],
    coverImage: {
      url: '/notes/note-puberty.jpg?v=2',
      alt: 'A young woman hugging a soft cushion on her bed in morning light',
      publicId: '',
    },
    excerpt:
      'Your body is learning a new rhythm. A longer, softer place to land while everything shifts — feelings, skin, sleep, and the first bleed.',
    content: [
      'Hey. If puberty feels loud, confusing, or somehow both exciting and heavy at once — that makes sense. Bodies do not change on a neat schedule. Yours has its own timing, and that timing is allowed to be yours.',
      'Some days you might notice new hair, softer or oilier skin, a different shape, bigger feelings, or a sudden need for more sleep. Other days nothing much shows on the outside, and the change is quieter. Both are part of growing. You are not “behind” because a classmate started earlier, and you are not “wrong” because your timeline looks different from a chart in a textbook.',
      'Feelings can swell too. Crushes, irritation, sudden tears, wanting to be alone, wanting to be held — these can arrive in the same week. That does not make you dramatic. It makes you a person whose body and brain are both under construction. Soft clothes, a snack, and a short walk often help more than pretending you are fine.',
      'When periods begin, bleeding can feel like a surprise even if you knew it was coming. Keep one small pack in your bag and one at home. Satin Ultra pack of 2 is printed “Carry it with you.” Regular and XL print the size and pad count on the pack, so you can choose what fits the day you are having.',
      'Tell someone you trust when you want company — a parent, sibling, friend, teacher, or clinic auntie. You do not have to decode every feeling alone. A hug, a warm drink, and a clear answer often help more than scrolling for hours. If pain is sharp, bleeding feels frightening, or something simply does not sit right in your body, ask a doctor. Soft words from a shop note are not a check-up.',
      hug,
    ].join('\n\n'),
  },
  {
    title: 'Your first period, with you',
    slug: 'period-basics-first-period',
    category: 'First Period',
    tags: ['period basics'],
    coverImage: {
      url: '/notes/note-first-period.jpg?v=2',
      alt: 'Hands gently holding a clean sanitary pad in soft light',
      publicId: '',
    },
    excerpt:
      'The first bleed can feel big. Here is a longer hug: how to meet it with care, a pad, a tiny kit, and people in your corner.',
    content: [
      'A first period is the first time blood from your uterus shows. It can be light pink, brown, or red. It can last a few days or a little longer. Your first one does not have to look like anyone else’s photo on the internet — and it does not have to feel “ready.” Ready is something you grow into.',
      'If you feel a rush of “what do I do now?”, pause. Find a bathroom. Wash your hands. Open a pad, peel the back, stick it to your underwear, and fold the wings under. That is enough for this moment. You can learn the fancy tips later. Breath first. Pad second. Panic can wait outside the door.',
      'Satin Regular and Satin XL packs print directions for use and disposal on the back. After, roll the used pad, wrap it, and put it in a dustbin — not the flush, unless your building clearly says otherwise. If you are away from home, a small pouch keeps things private and calm.',
      'Pack a tiny kit: two pads, a spare pair of underwear, and a pouch that zips. The Ultra pack of 2 is made for bags and lockers. Tell a trusted adult if you want help buying packs, or if you feel scared or in a lot of pain. Asking for help is not failing. It is how people get through firsts.',
      'You did not do anything wrong. Your body started a chapter. Be as kind to yourself as you would be to a friend sitting on the bathroom floor with the same surprise — a soft voice, a clean pad, and the reminder that this moment will pass into ordinary days again.',
      hug,
    ].join('\n\n'),
  },
  {
    title: 'PMS days, softer please',
    slug: 'period-basics-pms',
    category: 'PMS',
    tags: ['period basics'],
    coverImage: {
      url: '/notes/note-pms.jpg?v=2',
      alt: 'A young woman wrapped in a knit blanket holding a warm mug',
      publicId: '',
    },
    excerpt:
      'Those pre-period days when everything feels closer to the skin. A longer, gentler note for cramps, moods, and softer evenings.',
    content: [
      'Some people call the days before bleeding “PMS.” For many, that stretch means tender breasts, cramps, bloating, low patience, big feelings, tiredness, or wanting quiet. You might get all of that, some of it, or almost none. Your pattern is still valid. You do not need to earn rest by sounding dramatic enough.',
      'On those days, shrink the to-do list if you can. Warmth on the belly, water nearby, softer clothes, and an early night are small kindnesses that often help more than pushing through with clenched teeth. If you can only manage half the usual day, that half still counts.',
      'Write a few lines in a notes app or Satin’s tracker: sleep, mood, cramps, flow when it starts. After two or three cycles you may see your own weather report. That is for you — not a label someone else gets to stick on you. Patterns can make the next month feel less like a surprise attack.',
      'If the days before your period keep you from school, work, or sleep again and again, please book a doctor. Feeling “too much” is a reason to ask for care, not a reason to toughen up. Bring your notes. Bring a person who steadies you if that helps.',
      'And if all you manage today is a warm drink and a clean pad ready for when bleeding starts — that counts. Soft is still strong. You are allowed to want quiet, want a hug, and want the world to speak a little more gently for a few days.',
      hug,
    ].join('\n\n'),
  },
  {
    title: 'Your cycle, mapped with kindness',
    slug: 'period-basics-cycle-stages',
    category: 'Menstrual Cycle Stages',
    tags: ['period basics'],
    coverImage: {
      url: '/notes/note-cycle.jpg?v=2',
      alt: 'Hands writing period dates in a soft pink diary',
      publicId: '',
    },
    excerpt:
      'How people usually count a cycle — and why yours does not need to match a textbook. A longer, kinder map for your own rhythm.',
    content: [
      'Most people count a menstrual cycle from the first day of bleeding to the day before the next bleed begins. Bleeding days are only one part of that stretch. The rest of the month your body is still doing quiet work you cannot always feel. That quiet work is still yours to notice with curiosity, not judgment.',
      'Cycle length can differ from your friend’s, your sister’s, or the “28 days” you keep hearing. A shorter month or a longer month can still be your normal. What matters is what is usual for you, and whether that usual suddenly changes a lot. Sudden big shifts are a reason to ask a clinician — not a reason to panic alone at midnight.',
      'During bleeding, choose the Satin size and pad count printed on the pack for the day you are having — lighter days and heavier days do not always want the same pack. Outside bleeding days, a small carry pack still helps if your timing is still settling. Being prepared is a form of self-respect, not paranoia.',
      'Mark day one in a diary or tracker when you can. You are not chasing perfection. You are collecting a story your future self — and a clinician, if you need one — can read with you. Missed days are fine. Gentle consistency beats a perfect grid you abandon.',
      'This note is literacy, not a hormone lecture. If your cycles feel chaotic, painful, or scary, a doctor’s room is the right place for answers. Until then, treat your calendar like a soft companion: honest, patient, and never mean about what your body is doing.',
      hug,
    ].join('\n\n'),
  },
  {
    title: 'When something feels off',
    slug: 'period-basics-issues',
    category: 'Issues',
    tags: ['period basics'],
    coverImage: {
      url: '/notes/note-issues.jpg?v=2',
      alt: 'Two people holding hands for comfort on a soft sofa',
      publicId: '',
    },
    excerpt:
      'A longer hug for the days your period does not feel like your period — how to notice, who to tell, and what to bring to care.',
    content: [
      'You know your body better than a search bar does. If pain is sharper than usual, bleeding soaks through pads very fast, you bleed between periods, you miss many periods, or you simply feel unwell in a way you cannot shake — that deserves care. You do not need a perfect medical word before you are allowed to ask for help.',
      'Bring a person with you to the clinic if that steadies you. Write dates, flow, pain, sleep, and what you have already tried. You are not being dramatic. You are giving the clinician a clear map. A short list on your phone is enough. Soft handwriting in a notebook is enough too.',
      'Satin can help with pack choice and printed pack lines. We cannot tell you the cause of a symptom from a journal page. Home diagnoses often add fear without adding safety. Kind internet posts can comfort you; they cannot examine you. Hold that difference gently.',
      'While you wait for an appointment, keep pads that feel secure on your heavier days, rest when you can, and tell someone you trust how you are feeling. Being held — by a friend, a parent, or a kind clinician — is part of care too. You are allowed to want company in the waiting room.',
      'If something feels urgent or frightening, seek care sooner rather than waiting for the “right” day. Your comfort, your safety, and your peace of mind matter. Soft does not mean silent. Soft can still speak up.',
      hug,
    ].join('\n\n'),
  },
  {
    title: 'PCOD: you, not a Google list',
    slug: 'period-basics-pcod',
    category: 'PCOD',
    tags: ['period basics'],
    coverImage: {
      url: '/notes/note-pcod.jpg?v=2',
      alt: 'A young woman holding a notebook gently in a soft clinic waiting area',
      publicId: '',
    },
    excerpt:
      'When the letters PCOD keep showing up in your searches — a longer, softer way to take the next step without self-diagnosing.',
    content: [
      'PCOD is a short name people often use when talking about polycystic ovary related concerns. Online checklists can make you feel like every tired day or late period “must” be the same story. Bodies are more personal than that. A list on a screen is not the same as sitting across from someone who has heard your full history.',
      'Only a qualified clinician can sit with your story, examine you if needed, and decide what fits. Satin will not invent causes, diets, or cures here. That would not be love — that would be guessing with your health. You deserve answers that belong to you, not to a viral post.',
      'If you are booking a visit, write what you notice: cycle timing, skin or hair changes, weight shifts, mood, sleep, energy. Take a soft notebook. Take a support person if you want one. You deserve unhurried questions. “I am worried about my periods” is a complete sentence.',
      'Between appointments, keep using the pad size that feels safe on bleeding days. Soft routines — meals, water, sleep, a walk that does not punish you — are kindness, not a substitute for medical care. Be wary of anyone who sells fear and then sells a fix in the same breath.',
      'You are more than letters. PCOD talk can crowd your feed; it does not get to crowd out your self-worth. Go gently. Ask for care. Let Satin stay in its lane: pads, clear packs, and a journal that refuses to pretend it is a clinic.',
      hug,
    ].join('\n\n'),
  },
  {
    title: 'PCOS: questions held softly',
    slug: 'period-basics-pcos',
    category: 'PCOS',
    tags: ['period basics'],
    coverImage: {
      url: '/notes/note-pcos.jpg?v=2',
      alt: 'A young woman wrapped in a cardigan looking out a bright window',
      publicId: '',
    },
    excerpt:
      'For the nights PCOS tabs stay open on your phone — a longer note that puts you, your questions, and real care first.',
    content: [
      'PCOS is a condition a doctor may discuss after listening to you and reviewing tests. Social media often turns it into a short list of signs and a pile of “must do” rules. Real care is slower, kinder, and built around you. You are not a before-and-after photo. You are a person who deserves patience.',
      'If irregular cycles, skin or hair changes, weight worries, or fertility questions sit heavy on your chest, book a clinician. You do not need a perfect speech. “Something feels off with my periods” is enough to start. Bring the messy notes. Bring the screenshots if they help you remember — then let the clinician lead.',
      'Bring questions. Bring a person who makes you feel braver if that helps. You are allowed to ask what a word means, what a test is for, and what can wait. You are allowed to say “please say that again more slowly.” Clarity is not a luxury. It is part of being cared for.',
      'Satin’s place in this story is small and clear: pads when you bleed, honest pack printing, and a journal that will not pretend to diagnose you. Your health story belongs with medical care. Between visits, treat yourself the way you would treat a friend waiting for answers — warm drinks, soft clothes, no shame for needing rest.',
      'Whatever the next appointment brings, you are still whole. Letters on a form do not get to rewrite your worth. Hold your questions gently, and let a real clinician hold the answers with you.',
      hug,
    ].join('\n\n'),
  },
  {
    title: 'A late period, breathe first',
    slug: 'period-basics-late-period',
    category: 'Late Period',
    tags: ['period basics'],
    coverImage: {
      url: '/notes/note-late-period.jpg?v=2',
      alt: 'Hands holding a phone and a small calendar on a soft bed',
      publicId: '',
    },
    excerpt:
      'When the date passes and your body stays quiet — a calm, longer note for the waiting, the worry, and the next kind step.',
    content: [
      'A late period can make a whole day feel louder. Stress, travel, illness, sleep changes, and pregnancy are among the reasons people check. This note will not guess which one is yours. Guessing rarely hugs you; clarity does.',
      'If there is any chance of pregnancy, use a reliable test or ask a clinic. Waiting with a question in your stomach is hard — a clear answer, even when it is not the one you hoped for, is still a kind of relief. You do not have to face that moment alone if you do not want to.',
      'If you are not pregnant and periods stay late, keep skipping, or feel very different from your usual pattern, book a doctor. Take your cycle notes. You are allowed to want certainty. You are allowed to want someone else to hold the worry with you for a while.',
      'While you wait, keep a small Satin pack with you. The Ultra pack of 2 is printed for carrying on the go. Soft pants, a warm drink, and a message to someone who gets it are allowed too. Distraction that is kind — a walk, a show, a nap — is not denial. It is pacing yourself.',
      'Late does not mean you failed. It means your body asked for attention. Give it that attention with patience and real care. Breathe. Check what you need to check. Then let the next soft hour be yours again.',
      hug,
    ].join('\n\n'),
  },
];

async function seed() {
  await connectDb();
  const results = [];
  for (const note of notes) {
    const saved = await Blog.findOneAndUpdate(
      { slug: note.slug },
      {
        $set: {
          title: note.title,
          excerpt: note.excerpt,
          content: note.content,
          category: note.category,
          tags: note.tags,
          coverImage: note.coverImage,
          authorName: 'Satin',
          featured: false,
          published: true,
          publishedAt: new Date(),
        },
        $setOnInsert: { slug: note.slug },
      },
      { upsert: true, returnDocument: 'after' },
    );
    results.push({
      slug: saved.slug,
      category: saved.category,
      minutes: Math.max(1, Math.ceil(note.content.split(/\s+/).length / 200)),
      words: note.content.split(/\s+/).length,
    });
  }
  console.log(JSON.stringify({ upserted: results.length, notes: results }, null, 2));
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});

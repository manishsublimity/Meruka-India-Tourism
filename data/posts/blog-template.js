// Blog post template (23 Oct 2026): the starting point for new blog posts in the admin panel (Blog → Add post).
// It is never shown on the website (unpublished).
module.exports = {
  file: 'blog-template.html',
  url: '/blog/blog-template',
  unpublished: true,
  noindex: true,
  heading: 'Blog post template',
  category: 'Travel tips',
  date: '2026-10-23',
  author: 'Meruka India Tourism',
  excerpt: 'Two or three lines that tell the reader what the post is about. They show in the list of posts.',
  photo: '/photos/taj-mahal-feature.webp',
  html: '<p>Start with a short introduction.</p><h2>A heading</h2><p>Then the story, tips or news, in short paragraphs.</p>',
  title: 'Blog post template — Meruka India Tourism',
  description: '',
  keywords: '',
  breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }]
};

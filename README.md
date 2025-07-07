# Muhammad Anas Saleem - Professional Portfolio Website

A modern, responsive portfolio website showcasing AI development and software engineering expertise.

## 🚀 Features

- **Modern Design**: Clean, professional layout with gradient backgrounds and smooth animations
- **Responsive**: Fully responsive design that works on all devices
- **Interactive Animations**: 
  - Typing animation for hero title
  - Floating elements with parallax effects
  - Counter animations for statistics
  - Card tilt effects on hover
  - Smooth scroll animations (AOS)
- **Professional Sections**:
  - Hero section with social links
  - About section with education and stats
  - Skills categorized by technology type
  - Featured projects with descriptions
  - Professional experience timeline
  - Contact form with direct email integration

## 🛠️ Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Flexbox/Grid, animations, and transitions
- **JavaScript**: Interactive functionality and animations
- **AOS Library**: Animate On Scroll effects
- **Font Awesome**: Professional icons
- **Google Fonts**: Inter font family for modern typography

## 📁 File Structure

```
portfolio/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and animations
├── script.js           # JavaScript functionality
└── README.md          # Project documentation
```

## 🎨 Design Features

### Color Scheme
- Primary Gradient: #667eea to #764ba2
- Background: #f8f9fa for sections
- Text: #333 for headings, #666 for body text
- White cards with subtle shadows

### Animations
- **Typing Effect**: Hero title types out on page load
- **Floating Elements**: AI-themed icons float in hero section
- **Counter Animation**: Statistics count up when scrolled into view
- **Parallax**: Background elements move at different speeds
- **Hover Effects**: Interactive cards and buttons with smooth transitions

### Responsive Breakpoints
- Desktop: 1200px+ (full grid layouts)
- Tablet: 768px-1199px (adapted grids)
- Mobile: 320px-767px (single column, hamburger menu)

## 🚀 Getting Started

1. **Clone or Download** the files to your local machine
2. **Open** `index.html` in any modern web browser
3. **Customize** the content in `index.html` to match your information
4. **Modify** colors and styles in `styles.css` if needed
5. **Deploy** to any web hosting service

## 📧 Contact Integration

The contact form creates a mailto link that opens the user's default email client with pre-filled information. To implement a backend contact form:

1. Replace the form submission handler in `script.js`
2. Set up a backend service (Node.js, PHP, etc.)
3. Add form validation and spam protection

## 🔧 Customization

### Changing Colors
Update the CSS custom properties in `styles.css`:
```css
:root {
    --primary-gradient: linear-gradient(135deg, #your-color-1, #your-color-2);
    --text-primary: #your-text-color;
    --background-light: #your-bg-color;
}
```

### Adding Projects
Add new project cards in the projects section of `index.html`:
```html
<div class="project-card" data-aos="fade-up">
    <div class="project-image">
        <i class="fas fa-your-icon"></i>
    </div>
    <div class="project-content">
        <h3>Your Project Title</h3>
        <p>Your project description...</p>
        <div class="project-tags">
            <span class="tag">Technology 1</span>
            <span class="tag">Technology 2</span>
        </div>
    </div>
</div>
```

### Modifying Skills
Update the skills section with your technologies in `index.html`.

## 📱 Mobile Optimization

- Hamburger menu for mobile navigation
- Touch-friendly button sizes
- Optimized typography scales
- Single-column layouts on small screens
- Reduced animation complexity on mobile

## ⚡ Performance Features

- Optimized CSS animations using `transform` and `opacity`
- Lazy loading for images (when implemented)
- Smooth scrolling with `requestAnimationFrame`
- Intersection Observer for scroll animations
- Minimal external dependencies

## 🎯 SEO Considerations

- Semantic HTML structure
- Meta tags for social sharing
- Descriptive alt texts (when images added)
- Clean URL structure
- Fast loading times

## 📄 License

This portfolio template is free to use and modify for personal and commercial projects.

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements.

## 📞 Support

For questions about this portfolio website, contact:
- **Email**: anssaleem504@gmail.com
- **LinkedIn**: [linkedin.com/in/anas-saleem2004/](https://www.linkedin.com/in/anas-saleem2004/)

---

**Built with ❤️ by Muhammad Anas Saleem**

const scrollToTop = {
  methods: {
    scrollToTop() {
      if (typeof window.scrollTo === 'function') {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
    },
  },
};

export default scrollToTop;

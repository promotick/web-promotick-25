
class DropdownManager {
  constructor() {
    this.dropdowns = [];
    this.activeDropdown = null;
  }

  static init() {
    const manager = new DropdownManager();
    manager.initializeDropdowns();
    
    document.addEventListener('keydown', (e) => manager.handleKeydown(e));
    document.addEventListener('click', (e) => manager.handleClickOutside(e));
    
    const mobileNavToggle = document.querySelector('[data-mobile-nav-toggle]');
    if (mobileNavToggle) {
      mobileNavToggle.addEventListener('click', () => {
        manager.closeAllDropdowns();
      });
    }

    const searchToggle = document.querySelector('[data-search-toggle]');
    if (searchToggle) {
      searchToggle.addEventListener('click', () => {
        manager.closeAllDropdowns();
      });
    }
    
    return manager;
  }

  initializeDropdowns() {
    const dropdownElements = document.querySelectorAll('[data-dropdown]');
    
    dropdownElements.forEach(element => {
      this.createDropdown(element);
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('[data-dropdown]') && !e.target.closest('[data-dropdown-menu]')) {
        this.closeAllDropdowns();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllDropdowns();
      }
    });
  }

  createDropdown(element) {
    const trigger = element.querySelector('[data-dropdown-trigger]');
    const menu = element.querySelector('[data-dropdown-menu]');
    const arrow = element.querySelector('[data-dropdown-arrow]');
    const openIcon = element.querySelector('[data-dropdown-icon="open"]');
    const closeIcon = element.querySelector('[data-dropdown-icon="close"]');
    const closeButton = element.querySelector('[data-dropdown-close]');
    const selected = element.querySelector('[data-dropdown-selected]');

    if (!trigger || !menu) {
      console.warn('Dropdown: trigger o menu no encontrado', element);
      return;
    }

    const dropdown = {
      element,
      trigger,
      menu,
      arrow,
      openIcon,
      closeIcon,
      closeButton,
      selected,
      isOpen: false,
      portalMode: element.hasAttribute('data-dropdown-portal'),
      repositionHandler: null
    };

    this.dropdowns.push(dropdown);

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleDropdown(dropdown);
    });
    // Hover en desktop si está habilitado con data-dropdown-hover-desktop
    if (element.hasAttribute('data-dropdown-hover-desktop')) {
      element.addEventListener('mouseenter', () => {
        if (window.innerWidth >= 1024) this.openDropdown(dropdown);
      });
      element.addEventListener('mouseleave', () => {
        if (window.innerWidth >= 1024) {
          setTimeout(() => {
            const stillHover = element.matches(':hover') || (menu && menu.matches(':hover'));
            if (!stillHover) this.closeDropdown(dropdown);
          }, 80);
        }
      });
      if (menu) {
        menu.addEventListener('mouseleave', () => {
          if (window.innerWidth >= 1024) {
            setTimeout(() => {
              const stillHover = element.matches(':hover') || (menu && menu.matches(':hover'));
              if (!stillHover) this.closeDropdown(dropdown);
            }, 80);
          }
        });
      }
    }

    // Hover en desktop si está habilitado con data-dropdown-hover-desktop
    if (element.hasAttribute('data-dropdown-hover-desktop')) {
      element.addEventListener('mouseenter', () => {
        if (window.innerWidth >= 1024) {
          this.openDropdown(dropdown);
        }
      });
      element.addEventListener('mouseleave', () => {
        if (window.innerWidth >= 1024) {
          this.closeDropdown(dropdown);
        }
      });
    }

    if (closeButton) {
      closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeDropdown(dropdown);
      });
    }

    const menuLinks = menu.querySelectorAll('a');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.closeDropdown(dropdown);
      });
    });

    const menuItems = menu.querySelectorAll('li[data-value]');
    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        if (selected) {
          selected.textContent = item.textContent.trim();
        }
        
        const event = new CustomEvent('dropdownSelect', {
          detail: {
            value: item.dataset.value,
            text: item.textContent.trim(),
            element: dropdown.element
          }
        });
        dropdown.element.dispatchEvent(event);
        
        this.closeDropdown(dropdown);
      });
    });
  }

  toggleDropdown(dropdown) {
    if (dropdown.isOpen) {
      this.closeDropdown(dropdown);
    } else {
      this.openDropdown(dropdown);
    }
  }

  openDropdown(dropdown) {
    this.closeAllDropdowns();

    dropdown.isOpen = true;
    dropdown.menu.style.display = 'flex';
    dropdown.element.classList.add('dropdown-open');

    if (dropdown.arrow) {
      dropdown.arrow.classList.add('rotate-180');
    }

    if (dropdown.openIcon) dropdown.openIcon.classList.add('hidden');
    if (dropdown.closeIcon) dropdown.closeIcon.classList.remove('hidden');

    this.activeDropdown = dropdown;

    document.body.classList.add('dropdown-active');
    
    if (dropdown.closeButton) document.body.style.overflow = 'hidden';

    // Portal: posicionar como fixed para evadir overflow hidden (e.g., sliders)
    if (dropdown.portalMode && dropdown.menu) {
      dropdown.menu.classList.remove('hidden');
      dropdown.menu.style.opacity = '1';
      dropdown.menu.style.visibility = 'visible';
      dropdown.menu.style.transform = 'translateY(0)';
      if (!dropdown.menu.dataset.portalized) {
        document.body.appendChild(dropdown.menu);
        dropdown.menu.dataset.portalized = 'true';
      }
      const positionMenu = () => {
        const rect = dropdown.trigger.getBoundingClientRect();
        dropdown.menu.style.position = 'fixed';
        dropdown.menu.style.top = `${rect.bottom + 4}px`;
        dropdown.menu.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - dropdown.menu.offsetWidth - 8))}px`;
        dropdown.menu.style.zIndex = '1000';
      };
      positionMenu();
      dropdown.repositionHandler = positionMenu;
      window.addEventListener('scroll', dropdown.repositionHandler, true);
      window.addEventListener('resize', dropdown.repositionHandler, true);
    }
  }

  closeDropdown(dropdown) {
    dropdown.isOpen = false;
    dropdown.menu.style.display = 'none';
    dropdown.element.classList.remove('dropdown-open');

    if (dropdown.arrow) {
      dropdown.arrow.classList.remove('rotate-180');
    }

    if (dropdown.openIcon) dropdown.openIcon.classList.remove('hidden');
    if (dropdown.closeIcon) dropdown.closeIcon.classList.add('hidden');

    if (this.activeDropdown === dropdown) {
      this.activeDropdown = null;
      document.body.classList.remove('dropdown-active');
      
      if (dropdown.closeButton) document.body.style.overflow = '';

      if (dropdown.portalMode && dropdown.repositionHandler) {
        window.removeEventListener('scroll', dropdown.repositionHandler, true);
        window.removeEventListener('resize', dropdown.repositionHandler, true);
        dropdown.repositionHandler = null;
        dropdown.menu.classList.add('hidden');
        dropdown.menu.style.opacity = '0';
        dropdown.menu.style.visibility = 'hidden';
        dropdown.menu.style.transform = 'translateY(10px)';
      }
    }
  }

  closeAllDropdowns() {
    this.dropdowns.forEach(dropdown => {
      if (dropdown.isOpen) {
        dropdown.isOpen = false;
        dropdown.menu.style.display = 'none';
        dropdown.element.classList.remove('dropdown-open');

        if (dropdown.arrow) {
          dropdown.arrow.classList.remove('rotate-180');
        }

        if (dropdown.openIcon) {
          dropdown.openIcon.classList.remove('hidden');
        }
        if (dropdown.closeIcon) {
          dropdown.closeIcon.classList.add('hidden');
        }
      }
    });
    
    this.activeDropdown = null;
    document.body.classList.remove('dropdown-active');
    document.body.style.overflow = ''; // Restaurar scroll
  }

  closeAll() {
    this.closeAllDropdowns();
  }

  handleKeydown(event) {
    if (event.key === 'Escape' && this.activeDropdown) {
      this.closeDropdown(this.activeDropdown);
    }
  }

  handleClickOutside(event) {
    if (this.activeDropdown && !this.activeDropdown.element.contains(event.target)) {
      this.closeDropdown(this.activeDropdown);
    }
  }
}

class QuantityCounter {
  constructor() {
    this.counters = [];
    this.initializeCounters();
  }

  initializeCounters() {
    const counterElements = document.querySelectorAll('[data-quantity-counter]');
    
    counterElements.forEach(element => {
      this.createCounter(element);
    });
  }

  createCounter(element) {
    const minusBtn = element.querySelector('[data-quantity-minus]');
    const plusBtn = element.querySelector('[data-quantity-plus]');
    const display = element.querySelector('[data-quantity-display]');
    const minValue = parseInt(element.dataset.minValue) || 1;
    const maxValue = parseInt(element.dataset.maxValue) || 999;

    if (!minusBtn || !plusBtn || !display) {
      console.warn('QuantityCounter: elementos no encontrados', element);
      return;
    }

    const counter = {
      element,
      minusBtn,
      plusBtn,
      display,
      minValue,
      maxValue,
      currentValue: parseInt(display.textContent) || minValue
    };

    this.counters.push(counter);

    this.updateDisplay(counter);

    minusBtn.addEventListener('click', () => {
      this.decrement(counter);
    });

    plusBtn.addEventListener('click', () => {
      this.increment(counter);
    });
  }

  decrement(counter) {
    if (counter.currentValue > counter.minValue) {
      counter.currentValue--;
      this.updateDisplay(counter);
      this.triggerChangeEvent(counter);
    }
  }

  increment(counter) {
    if (counter.currentValue < counter.maxValue) {
      counter.currentValue++;
      this.updateDisplay(counter);
      this.triggerChangeEvent(counter);
    }
  }

  updateDisplay(counter) {
    counter.display.textContent = counter.currentValue;
    
    if (counter.currentValue <= counter.minValue) {
      counter.minusBtn.classList.add('opacity-25', 'cursor-not-allowed', 'pointer-events-none');
      counter.minusBtn.disabled = true;
    } else {
      counter.minusBtn.classList.remove('opacity-25', 'cursor-not-allowed', 'pointer-events-none');
      counter.minusBtn.disabled = false;
    }

    if (counter.currentValue >= counter.maxValue) {
      counter.plusBtn.classList.add('opacity-25', 'cursor-not-allowed', 'pointer-events-none');
      counter.plusBtn.disabled = true;
    } else {
      counter.plusBtn.classList.remove('opacity-25', 'cursor-not-allowed', 'pointer-events-none');
      counter.plusBtn.disabled = false;
    }
  }

  triggerChangeEvent(counter) {
    const event = new CustomEvent('quantityChange', {
      detail: {
        value: counter.currentValue,
        element: counter.element
      }
    });
    counter.element.dispatchEvent(event);
  }

  static init() {
    return new QuantityCounter();
  }
}

class CustomCheckbox {
  constructor() {
    this.checkboxes = [];
    this.initializeCheckboxes();
  }

  initializeCheckboxes() {
    const checkboxElements = document.querySelectorAll('[data-checkbox]');
    
    checkboxElements.forEach(element => {
      this.createCheckbox(element);
    });
  }

  createCheckbox(element) {
    const input = element.querySelector('[data-checkbox-input]');
    const display = element.querySelector('[data-checkbox-display]');
    const icon = element.querySelector('[data-checkbox-icon]');
    const label = element.querySelector('[data-checkbox-label]');

    if (!input || !display) {
      console.warn('CustomCheckbox: input o display no encontrado', element);
      return;
    }

    const checkbox = {
      element,
      input,
      display,
      icon,
      label,
      isChecked: input.checked
    };

    this.checkboxes.push(checkbox);

    this.updateDisplay(checkbox);

    input.addEventListener('change', () => {
      this.toggleCheckbox(checkbox);
    });

    if (label) {
      label.addEventListener('click', (e) => {
        e.preventDefault();
        input.checked = !input.checked;
        this.toggleCheckbox(checkbox);
      });
    }
  }

  toggleCheckbox(checkbox) {
    checkbox.isChecked = checkbox.input.checked;
    this.updateDisplay(checkbox);
    this.triggerChangeEvent(checkbox);
  }

  updateDisplay(checkbox) {
    if (checkbox.isChecked) {
      checkbox.display.classList.remove('border-[#687286]', 'bg-white');
      checkbox.display.classList.add('border-[#E4022C]', 'bg-[#E4022C]');
      
      if (checkbox.icon) {
        checkbox.icon.classList.remove('hidden');
      }
    } else {
      checkbox.display.classList.remove('border-[#E4022C]', 'bg-[#E4022C]');
      checkbox.display.classList.add('border-[#687286]', 'bg-white');
      
      if (checkbox.icon) {
        checkbox.icon.classList.add('hidden');
      }
    }
  }

  triggerChangeEvent(checkbox) {
    const event = new CustomEvent('checkboxChange', {
      detail: {
        checked: checkbox.isChecked,
        value: checkbox.input.value,
        element: checkbox.element
      }
    });
    checkbox.element.dispatchEvent(event);
  }

  static init() {
    return new CustomCheckbox();
  }
}


class RadioGroup {
  constructor() {
    this.groups = [];
    this.initializeGroups();
  }

  initializeGroups() {
    const groupElements = document.querySelectorAll('[data-radio-group]');

    groupElements.forEach(element => {
      this.createGroup(element);
    });
  }

  createGroup(element) {
    const optionElements = Array.from(element.querySelectorAll('[data-radio-option]'));
    if (optionElements.length === 0) {
      console.warn('RadioGroup: no se encontraron opciones', element);
      return;
    }

    const group = {
      element,
      options: optionElements,
      activeOption: null,
      style: element.dataset.radioStyle || 'chip' // 'chip' o 'swatch'
    };

    const initialOption = optionElements.find(opt => opt.hasAttribute('data-selected')) || optionElements[0];
    this.setActiveOption(group, initialOption, false);

    optionElements.forEach(option => {
      option.addEventListener('click', () => {
        this.setActiveOption(group, option, true);
      });
    });

    this.groups.push(group);
  }

  setActiveOption(group, optionToActivate, emitEvent = true) {
    if (!group || !optionToActivate) return;

    group.options.forEach(option => {
      const isActive = option === optionToActivate;

      if (group.style === 'icon') {
      } else if (group.style === 'swatch') {
        option.classList.remove('border-[2px]', 'border-[#E4022C]');
      } else {
        option.classList.remove('border-[#E4022C]', 'text-[#E4022C]', 'bg-[#FFF1F0]', 'font-semibold');
        option.classList.remove('border-[#C6C8CC]', 'text-[#C6C8CC]', 'bg-transparent', 'font-light');
      }

      if (group.style === 'icon') {
        if (isActive) {
          option.setAttribute('aria-checked', 'true');
          option.setAttribute('data-selected', '');
        } else {
          option.setAttribute('aria-checked', 'false');
          option.removeAttribute('data-selected');
        }

        const iconEl = option.querySelector('[data-radio-icon]');
        if (iconEl) {
          const activeSrc = iconEl.dataset.radioActiveSrc;
          const inactiveSrc = iconEl.dataset.radioInactiveSrc;
          if (activeSrc && inactiveSrc) {
            iconEl.src = isActive ? activeSrc : inactiveSrc;
          }
        }
      } else if (group.style === 'swatch') {
        if (isActive) {
          option.classList.add('border-[2px]', 'border-[#E4022C]');
          option.setAttribute('aria-checked', 'true');
          option.setAttribute('data-selected', '');
        } else {
          option.setAttribute('aria-checked', 'false');
          option.removeAttribute('data-selected');
        }
      } else {
        if (isActive) {
          option.classList.add('border-[#E4022C]', 'text-[#E4022C]', 'bg-[#FFF1F0]', 'font-semibold');
          option.setAttribute('aria-checked', 'true');
          option.setAttribute('data-selected', '');
        } else {
          option.classList.add('border-[#C6C8CC]', 'text-[#C6C8CC]', 'bg-transparent', 'font-light');
          option.setAttribute('aria-checked', 'false');
          option.removeAttribute('data-selected');
        }
      }
      option.setAttribute('role', 'radio');
      option.setAttribute('tabindex', '0');
    });

    group.element.setAttribute('role', 'radiogroup');
    group.activeOption = optionToActivate;

    if (emitEvent) {
      const event = new CustomEvent('radioChange', {
        detail: {
          value: optionToActivate.dataset.radioValue || null,
          element: group.element,
          option: optionToActivate
        }
      });
      group.element.dispatchEvent(event);
    }
  }

  static init() {
    return new RadioGroup();
  }
}

class Accordion {
  constructor() {
    this.accordions = [];
    this.groups = new Map(); // key: HTMLElement del grupo, value: acordeones del grupo
    this.initializeAccordions();
  }

  initializeAccordions() {
    const accordionElements = document.querySelectorAll('[data-accordion]');
    
    accordionElements.forEach(element => {
      this.createAccordion(element);
    });
  }

  createAccordion(element) {
    const trigger = element.querySelector('[data-accordion-trigger]');
    const content = element.querySelector('[data-accordion-content]');
    const arrow = element.querySelector('[data-accordion-arrow]');
    const groupEl = element.closest('[data-accordion-group]');

    if (!trigger || !content) {
      console.warn('Accordion: trigger o content no encontrado', element);
      return;
    }

    const accordion = {
      element,
      trigger,
      content,
      arrow,
      isOpen: false,
      groupEl
    };

    this.accordions.push(accordion);

    if (groupEl) {
      if (!this.groups.has(groupEl)) this.groups.set(groupEl, []);
      this.groups.get(groupEl).push(accordion);
    }

    trigger.addEventListener('click', () => {
      this.toggleAccordion(accordion);
    });

    this.updateState(accordion);
  }

  toggleAccordion(accordion) {
    const willOpen = !accordion.isOpen;

    if (willOpen && accordion.groupEl && this.groups.has(accordion.groupEl)) {
      const siblings = this.groups.get(accordion.groupEl);
      siblings.forEach(acc => {
        if (acc !== accordion && acc.isOpen) {
          acc.isOpen = false;
          this.updateState(acc);
        }
      });
    }

    accordion.isOpen = willOpen;
    this.updateState(accordion);
  }

  updateState(accordion) {
    const { content, arrow, isOpen } = accordion;

    if (isOpen) {
      content.style.display = 'block';
      content.classList.remove('hidden');
      if (arrow) {
        const customRotate = arrow.dataset.accordionArrowRotate;
        if (customRotate === '90') {
          arrow.style.transform = 'rotate(90deg)';
          if (!arrow.style.transition) {
            arrow.style.transition = 'transform 200ms';
          }
        }
      }
    } else {
      content.style.display = 'none';
      content.classList.add('hidden');
      if (arrow) {
        const customRotate = arrow.dataset.accordionArrowRotate;
        if (customRotate === '90') {
          arrow.style.transform = 'rotate(0deg)';
          if (!arrow.style.transition) {
            arrow.style.transition = 'transform 200ms';
          }
        }
      }
    }
  }

  static init() {
    return new Accordion();
  }
}

class SearchInput {
  constructor() {
    this.searchInputs = [];
    this.initializeSearchInputs();
  }

  initializeSearchInputs() {
    const searchElements = document.querySelectorAll('[data-search-input]');
    
    searchElements.forEach(element => {
      this.createSearchInput(element);
    });
  }

  createSearchInput(element) {
    const label = element.querySelector('[data-search-label]');
    const container = element.querySelector('[data-search-container]');
    const field = element.querySelector('[data-search-field]');
    const clearBtn = element.querySelector('[data-search-clear]');

    if (!field || !container) {
      console.warn('SearchInput: field o container no encontrado', element);
      return;
    }

    const searchInput = {
      element,
      label,
      container,
      field,
      clearBtn,
      isFocused: false,
      hasValue: false,
      isHovered: false
    };

    this.searchInputs.push(searchInput);

    field.addEventListener('focus', () => {
      searchInput.isFocused = true;
      this.updateState(searchInput);
    });

    field.addEventListener('blur', () => {
      searchInput.isFocused = false;
      this.updateState(searchInput);
    });

    field.addEventListener('input', () => {
      searchInput.hasValue = field.value.length > 0;
      this.updateState(searchInput);
    });

    container.addEventListener('mouseenter', () => {
      if (!searchInput.isFocused) {
        searchInput.isHovered = true;
        this.updateState(searchInput);
      }
    });

    container.addEventListener('mouseleave', () => {
      searchInput.isHovered = false;
      this.updateState(searchInput);
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        field.value = '';
        searchInput.hasValue = false;
        this.updateState(searchInput);
        field.focus();
      });
    }

    if (label) {
      label.addEventListener('click', () => {
        field.focus();
      });
    }

    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        searchInput.isFocused = false;
        searchInput.isHovered = false;
        this.updateState(searchInput);
      }
    });

    this.updateState(searchInput);
  }


  updateState(searchInput) {
    const { container, label, isFocused, hasValue, isHovered } = searchInput;

    container.classList.remove('border-[#3C3B3B]', 'border-[#E4022C]', 'shadow-[0_0_0_3px_#E4022C]', 'search-focused', 'search-has-value');
    if (label) label.classList.remove('text-[#E4022C]');

    if (isFocused) {
      container.classList.add('border-[#E4022C]', 'shadow-[0_0_0_3px_#E4022C]', 'search-focused');
      if (label) label.classList.add('text-[#E4022C]');
    }
    else if (isHovered) {
      container.classList.add('border-[#3C3B3B]');
    }

    if (hasValue) {
      container.classList.add('search-has-value');
    }
  }

  triggerEvent(eventType, searchInput) {
    const event = new CustomEvent(`search${eventType.charAt(0).toUpperCase() + eventType.slice(1)}`, {
      detail: {
        value: searchInput.field.value,
        element: searchInput.element
      }
    });
    searchInput.element.dispatchEvent(event);
  }

  static init() {
    return new SearchInput();
  }
}

document.addEventListener('DOMContentLoaded', function() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 4000,
      once: false,
      offset: 100,
      easing: 'cubic-bezier(0.26, -0.08, 0.04, 1)'
    });
  }

  initializeSwipers();

  DropdownManager.init();
  
  QuantityCounter.init();
  
  CustomCheckbox.init();
  
  RadioGroup.init();
  
  SearchInput.init();

  FormField.init();

  Accordion.init();

  MobileNav.init();

  SearchToggle.init();

  Tabs.init();

  if (typeof MicroModal !== 'undefined') {
    MicroModal.init({
      disableScroll: true,
      openClass: 'is-open',
    });
  }

  ModalChain.init();

  HeartToggle.init();

  Popover.init();
});

function initializeSwipers() {
  if (typeof Swiper !== 'undefined' && document.querySelector('.swiper-destacados')) {
    const swiperDestacados = new Swiper('.swiper-destacados', {
      slidesPerView: 1.2,
      spaceBetween: 24,
      loop: false,
      centeredSlides: false,
      watchSlidesProgress: true,
      navigation: {
        nextEl: '.swiper-button-next-destacados',
        prevEl: '.swiper-button-prev-destacados',
      },
      breakpoints: {
        640: {
          slidesPerView: 2,
          spaceBetween: 24,
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 24,
        },
        1024: {
          slidesPerView: 4,
          spaceBetween: 24,
        },
      }
    });
  }

  if (typeof Swiper !== 'undefined' && document.querySelector('.swiper-recomendados')) {
    const swiperRecomendados = new Swiper('.swiper-recomendados', {
      slidesPerView: 1.2,
      spaceBetween: 24,
      loop: false,
      centeredSlides: false,
      watchSlidesProgress: true,
      navigation: {
        nextEl: '.swiper-button-next-recomendados',
        prevEl: '.swiper-button-prev-recomendados',
      },
      breakpoints: {
        640: {
          slidesPerView: 2,
          spaceBetween: 24,
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 24,
        },
        1024: {
          slidesPerView: 4,
          spaceBetween: 24,
        },
      }
    });
  }

  if (typeof Swiper !== 'undefined' && document.querySelector('.swiper-buscados')) {
    const swiperBuscados = new Swiper('.swiper-buscados', {
      slidesPerView: 1.2,
      spaceBetween: 24,
      loop: false,
      centeredSlides: false,
      watchSlidesProgress: true,
      navigation: {
        nextEl: '.swiper-button-next-buscados',
        prevEl: '.swiper-button-prev-buscados',
      },
      breakpoints: {
        640: {
          slidesPerView: 2,
          spaceBetween: 24,
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 24,
        },
        1024: {
          slidesPerView: 4,
          spaceBetween: 24,
        },
      }
    });
  }

  if (typeof Swiper !== 'undefined' && document.querySelector('.swiper-banner')) {
    const swiperBanner = new Swiper('.swiper-banner', {
      slidesPerView: 1,
      spaceBetween: 0,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: '.swiper-button-next-banner',
        prevEl: '.swiper-button-prev-banner',
      },
      pagination: {
        el: '.swiper-pagination-banner',
        clickable: true,
      },
      effect: 'fade',
      fadeEffect: {
        crossFade: true
      }
    });
  }

  if (typeof Swiper !== 'undefined' && document.querySelector('.swiper-ofertas')) {
    const swiperOfertas = new Swiper('.swiper-ofertas', {
      slidesPerView: "auto",
      spaceBetween: 16,
      loop: false,
      centeredSlides: false,
      navigation: {
        nextEl: '.swiper-button-next-ofertas',
        prevEl: '.swiper-button-prev-ofertas',
      },
      breakpoints: {
        320: {
          slidesPerView: "auto",
          spaceBetween: 16,
        },
        640: {
          slidesPerView: "auto",
          spaceBetween: 16,
        },
        768: {
          slidesPerView: "auto",
          spaceBetween: 16,
        },
        1024: {
          slidesPerView: "auto",
          spaceBetween: 16,
        },
      }
    });
  }

  if (typeof Swiper !== 'undefined' && document.querySelector('.swiper-categories')) {
    const swiperCategories = new Swiper('.swiper-categories', {
      slidesPerView: "auto",
      spaceBetween: 16,
      loop: false,
      centeredSlides: false,
      freeMode: {
        enabled: true,
        sticky: false,
      },
      navigation: {
        nextEl: '.swiper-button-next-categories',
        prevEl: '.swiper-button-prev-categories',
      },
      breakpoints: {
        320: {
          slidesPerView: "auto",
          spaceBetween: 16,
          freeMode: {
            enabled: true,
            sticky: false,
          },
        },
        640: {
          slidesPerView: "auto",
          spaceBetween: 16,
          freeMode: {
            enabled: true,
            sticky: false,
          },
        },
        768: {
          slidesPerView: "auto",
          spaceBetween: 16,
          freeMode: {
            enabled: true,
            sticky: false,
          },
        },
        1024: {
          slidesPerView: 10,
          spaceBetween: 0,
          freeMode: {
            enabled: false,
          },
          slidesPerGroup: 1,
        },
      }
    });
  }
}

class MobileNav {
  constructor() {
    this.toggleButton = document.querySelector('[data-mobile-nav-toggle]');
    this.panel = document.querySelector('[data-mobile-nav-panel]');
    this.openIcon = this.toggleButton ? this.toggleButton.querySelector('[data-mobile-nav-icon="open"]') : null;
    this.closeIcon = this.toggleButton ? this.toggleButton.querySelector('[data-mobile-nav-icon="close"]') : null;
    this.isOpen = false;
    this.bindEvents();
  }

  bindEvents() {
    if (!this.toggleButton || !this.panel) return;

    this.toggleButton.addEventListener('click', () => this.toggle());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024 && this.isOpen) this.close();
    });

    this.panel.addEventListener('click', (e) => {
      const target = e.target;
      if (target && (target.tagName === 'A' || target.closest('a'))) this.close();
    });

    const searchToggle = document.querySelector('[data-search-toggle]');
    if (searchToggle) {
      searchToggle.addEventListener('click', () => {
        if (this.isOpen) this.close();
      });
    }

    const cartToggle = document.querySelector('[data-dropdown-trigger]');
    if (cartToggle) {
      cartToggle.addEventListener('click', () => {
        if (this.isOpen) this.close();
      });
    }
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.panel.classList.remove('hidden');
    this.toggleButton.setAttribute('aria-expanded', 'true');
    if (this.openIcon) this.openIcon.classList.add('hidden');
    if (this.closeIcon) this.closeIcon.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }

  close() {
    this.isOpen = false;
    this.panel.classList.add('hidden');
    this.toggleButton.setAttribute('aria-expanded', 'false');
    if (this.openIcon) this.openIcon.classList.remove('hidden');
    if (this.closeIcon) this.closeIcon.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }

  static init() {
    return new MobileNav();
  }
}

class SearchToggle {
  constructor() {
    this.toggleButton = document.querySelector('[data-search-toggle]');
    this.panel = document.querySelector('[data-search-panel]');
    this.input = this.panel ? this.panel.querySelector('[data-search-input]') : null;
    this.openIcon = this.toggleButton ? this.toggleButton.querySelector('[data-search-icon="open"]') : null;
    this.closeIcon = this.toggleButton ? this.toggleButton.querySelector('[data-search-icon="close"]') : null;
    this.isOpen = false;
    this.initializeState();
    this.bindEvents();
  }

  initializeState() {
    if (this.openIcon) this.openIcon.classList.remove('hidden');
    if (this.closeIcon) this.closeIcon.classList.add('hidden');
  }

  bindEvents() {
    if (!this.toggleButton || !this.panel) return;

    this.toggleButton.addEventListener('click', () => this.toggle());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });


    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.panel.contains(e.target) && !this.toggleButton.contains(e.target)) {
        this.close();
      }
    });

    this.panel.addEventListener('transitionend', () => {
      if (this.isOpen && this.input) {
        this.input.focus();
      }
    });

    const mobileNavToggle = document.querySelector('[data-mobile-nav-toggle]');
    if (mobileNavToggle) {
      mobileNavToggle.addEventListener('click', () => {
        if (this.isOpen) this.close();
      });
    }

    const cartToggle = document.querySelector('[data-dropdown-trigger]');
    if (cartToggle) {
      cartToggle.addEventListener('click', () => {
        if (this.isOpen) this.close();
      });
    }
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.panel.classList.remove('hidden');
    this.toggleButton.setAttribute('aria-expanded', 'true');
    
    if (this.openIcon) this.openIcon.classList.add('hidden');
    if (this.closeIcon) this.closeIcon.classList.remove('hidden');
    
    document.body.classList.add('overflow-hidden');
    
    setTimeout(() => {
      if (this.input) this.input.focus();
    }, 100);
  }

  close() {
    this.isOpen = false;
    this.panel.classList.add('hidden');
    this.toggleButton.setAttribute('aria-expanded', 'false');
    
    if (this.openIcon) this.openIcon.classList.remove('hidden');
    if (this.closeIcon) this.closeIcon.classList.add('hidden');
    
    document.body.classList.remove('overflow-hidden');
    
    if (this.input) this.input.value = '';
  }

  static init() {
    return new SearchToggle();
  }
}

class FormField {
  constructor() {
    this.fields = [];
    this.initializeFields();
  }

  initializeFields() {
    const elements = document.querySelectorAll('[data-field]');
    elements.forEach(el => this.createField(el));
  }

  createField(element) {
    const container = element.querySelector('[data-field-container]');
    const input = element.querySelector('[data-field-input]');
    const label = element.querySelector('[data-field-label]');
    const clearBtn = element.querySelector('[data-field-clear]');

    if (!container || !input) {
      console.warn('FormField: container o input no encontrado', element);
      return;
    }

    const field = {
      element,
      container,
      input,
      label,
      clearBtn,
      isSelect: input.tagName && input.tagName.toLowerCase() === 'select',
      isFocused: false,
      hasValue: (input.value && input.value.length > 0) || false,
      isHovered: false
    };

    this.fields.push(field);

    if (element.dataset.fieldInitial === 'active' || field.isSelect) {
      field.hasValue = true;
    }

    input.addEventListener('focus', () => {
      field.isFocused = true;
      this.updateState(field);
    });

    input.addEventListener('blur', () => {
      field.isFocused = false;
      this.updateState(field);
    });

    input.addEventListener('input', () => {
      field.hasValue = input.value.length > 0;
      this.updateState(field);
    });

    input.addEventListener('change', () => {
      field.hasValue = input.value.length > 0;
      this.updateState(field);
    });

    container.addEventListener('mouseenter', () => {
      if (!field.isFocused) {
        field.isHovered = true;
        this.updateState(field);
      }
    });

    container.addEventListener('mouseleave', () => {
      field.isHovered = false;
      this.updateState(field);
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        input.value = '';
        field.hasValue = false;
        this.updateState(field);
        input.focus();
      });
    }

    if (label) {
      label.addEventListener('click', () => {
        input.focus();
      });
    }

    this.updateState(field);
  }

  updateState(field) {
    const { container, label, isFocused, hasValue, isHovered, isSelect } = field;

    container.classList.remove('border-[#3C3B3B]', 'border-[#E4022C]', 'shadow-[0_0_0_3px_#E4022C]', 'field-focused', 'field-has-value');

    if (isFocused) {
      container.classList.add('border-[#E4022C]', 'shadow-[0_0_0_3px_#E4022C]', 'field-focused');
    } else if (isHovered) {
      container.classList.add('border-[#3C3B3B]');
    }

    if (hasValue || isSelect) {
      container.classList.add('field-has-value');
    }
  }

  static init() {
    return new FormField();
  }
}

class ModalChain {
  constructor() {
    this.bindEvents();
  }

  bindEvents() {
    const triggers = document.querySelectorAll('[data-modal-next]');
    triggers.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const nextId = btn.getAttribute('data-modal-next');
        if (!nextId || typeof MicroModal === 'undefined') return;

        e.preventDefault();
        e.stopPropagation();

        const currentModal = btn.closest('.modal');
        const currentId = currentModal && currentModal.id ? currentModal.id : null;

        if (currentId) {
          if (currentModal && currentModal.classList.contains('is-open')) {
            currentModal.classList.add('is-leaving');
          }
          setTimeout(() => {
            try { MicroModal.close(currentId); } catch (_) {}
            if (currentModal) currentModal.classList.remove('is-leaving');
            setTimeout(() => {
              try { MicroModal.show(nextId); } catch (_) {}
            }, 50);
          }, 180);
        } else {
          try { MicroModal.show(nextId); } catch (_) {}
        }
      });
    });
  }

  static init() {
    return new ModalChain();
  }
}

class Tabs {
  constructor() {
    this.instances = [];
    this.initialize();
  }

  initialize() {
    const containers = document.querySelectorAll('[data-tabs]');
    containers.forEach(container => this.createTabs(container));
  }

  createTabs(container) {
    const triggers = Array.from(container.querySelectorAll('[data-tab-target]'));
    const panels = Array.from(container.querySelectorAll('[data-tab-panel]'));

    if (triggers.length === 0 || panels.length === 0) {
      console.warn('Tabs: no se encontraron triggers o panels', container);
      return;
    }

    const instance = {
      container,
      triggers,
      panels,
      activeName: null
    };

    const preset = triggers.find(btn => btn.getAttribute('aria-selected') === 'true');
    const initialTrigger = preset || triggers[0];
    this.setActive(instance, initialTrigger.dataset.tabTarget, false);

    // Activar tab por URL (?tab=nombre o #tab=nombre o #nombre)
    try {
      const url = new URL(window.location.href);
      let desired = url.searchParams.get('tab');
      if (!desired && window.location.hash) {
        const hashVal = window.location.hash.replace('#', '');
        desired = hashVal.startsWith('tab=') ? hashVal.split('=')[1] : hashVal;
      }
      if (desired) {
        const exists = triggers.find(btn => btn.dataset.tabTarget === desired);
        if (exists) this.setActive(instance, desired, false);
      }
    } catch (_) {}

    triggers.forEach(btn => {
      btn.addEventListener('click', () => {
        this.setActive(instance, btn.dataset.tabTarget, true);
      });

      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.setActive(instance, btn.dataset.tabTarget, true);
        }
      });
    });

    this.instances.push(instance);
  }

  setActive(instance, name, emit = true) {
    instance.activeName = name;

    instance.triggers.forEach(btn => {
      const isActive = btn.dataset.tabTarget === name;
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      btn.setAttribute('tabindex', isActive ? '0' : '-1');

      const icon = btn.querySelector('[data-tab-icon]');
      const activeSrc = btn.dataset.tabActiveSrc;
      const inactiveSrc = btn.dataset.tabInactiveSrc;
      if (icon && activeSrc && inactiveSrc) {
        icon.src = isActive ? activeSrc : inactiveSrc;
      }

      const activeClasses = (btn.dataset.tabActiveClasses || '').split(/\s+/).filter(Boolean);
      const inactiveClasses = (btn.dataset.tabInactiveClasses || '').split(/\s+/).filter(Boolean);
      if (activeClasses.length || inactiveClasses.length) {
        if (isActive) {
          if (inactiveClasses.length) btn.classList.remove(...inactiveClasses);
          if (activeClasses.length) btn.classList.add(...activeClasses);
        } else {
          if (activeClasses.length) btn.classList.remove(...activeClasses);
          if (inactiveClasses.length) btn.classList.add(...inactiveClasses);
        }
      }
    });

    instance.panels.forEach(panel => {
      const isActive = panel.getAttribute('data-tab-panel') === name;
      panel.hidden = !isActive;
      panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });

    if (emit) {
      const event = new CustomEvent('tabChange', {
        detail: { name, container: instance.container }
      });
      instance.container.dispatchEvent(event);
    }
  }

  static init() {
    return new Tabs();
  }
}

class Popover {
  constructor() {
    this.instances = [];
    this.onDocClick = this.onDocClick.bind(this);
    this.init();
  }

  init() {
    const nodes = document.querySelectorAll('[data-popover]');
    nodes.forEach(node => this.create(node));
    document.addEventListener('click', this.onDocClick);
  }

  create(el) {
    const trigger = el.querySelector('[data-popover-trigger]');
    const menu = el.querySelector('[data-popover-menu]');
    if (!trigger || !menu) return;

    const inst = { el, trigger, menu, isOpen: false, handler: null };
    this.instances.push(inst);

    const openHover = () => { if (window.innerWidth >= 1024) this.open(inst); };
    const closeHover = () => {
      if (window.innerWidth >= 1024) {
        setTimeout(() => {
          const over = inst.trigger.matches(':hover') || inst.menu.matches(':hover');
          if (!over) this.close(inst);
        }, 80);
      }
    };

    el.addEventListener('mouseenter', openHover);
    el.addEventListener('mouseleave', closeHover);
    inst.menu.addEventListener('mouseleave', closeHover);

    trigger.addEventListener('click', (e) => {
      if (window.innerWidth < 1024) {
        e.preventDefault();
        e.stopPropagation();
        this.toggle(inst);
      }
    });
  }

  onDocClick(e) {
    const menu = e.target.closest('[data-popover-menu]');
    const wrap = e.target.closest('[data-popover]');
    if (!menu && !wrap) this.closeAll();
  }

  toggle(inst) { inst.isOpen ? this.close(inst) : this.open(inst); }

  open(inst) {
    this.closeAll();
    inst.isOpen = true;
    const rect = inst.trigger.getBoundingClientRect();
    if (!inst.menu.dataset.popoverPortalized) {
      document.body.appendChild(inst.menu);
      inst.menu.dataset.popoverPortalized = 'true';
    }
    inst.menu.style.display = 'block';
    inst.menu.style.position = 'fixed';
    const menuW = inst.menu.offsetWidth;
    const centeredLeft = rect.left + (rect.width / 2) - (menuW / 2);
    const left = Math.max(8, Math.min(centeredLeft, window.innerWidth - menuW - 8));
    inst.menu.style.top = `${rect.bottom + 4}px`;
    inst.menu.style.left = `${left}px`;
    inst.menu.style.zIndex = '1000';
    inst.menu.classList.remove('hidden');
    inst.handler = () => {
      const r = inst.trigger.getBoundingClientRect();
      const mW = inst.menu.offsetWidth;
      const cLeft = r.left + (r.width / 2) - (mW / 2);
      const l = Math.max(8, Math.min(cLeft, window.innerWidth - mW - 8));
      inst.menu.style.top = `${r.bottom + 4}px`;
      inst.menu.style.left = `${l}px`;
    };
    window.addEventListener('scroll', inst.handler, true);
    window.addEventListener('resize', inst.handler, true);
  }

  close(inst) {
    inst.isOpen = false;
    inst.menu.style.display = 'none';
    inst.menu.classList.add('hidden');
    if (inst.handler) {
      window.removeEventListener('scroll', inst.handler, true);
      window.removeEventListener('resize', inst.handler, true);
      inst.handler = null;
    }
  }

  closeAll() { this.instances.forEach(i => i.isOpen && this.close(i)); }

  static init() { return new Popover(); }
}

class HeartToggle {
  constructor() {
    this.bindAll();
  }

  bindAll() {
    const buttons = Array.from(document.querySelectorAll('[data-heart-toggle]'));
    buttons.forEach(btn => this.bindButton(btn));

    const selector = 'img[src$="/img/icon/heart.svg"], img[src$="/img/icon/heart-black.svg"], img[src$="icon/heart.svg"], img[src$="icon/heart-black.svg"]';
    const icons = Array.from(document.querySelectorAll(selector));
    icons.forEach(icon => this.bindIcon(icon));
  }

  bindIcon(icon) {
    const button = icon.closest('button');
    if (button && button.hasAttribute('data-heart-toggle')) return;
    if (!button) return;

    if (button.dataset.heartBound === 'true') return;

    button.setAttribute('aria-pressed', button.getAttribute('aria-pressed') || 'false');

    button.addEventListener('click', (e) => {
      const anchor = button.closest('a');
      if (anchor) {
        e.preventDefault();
        e.stopPropagation();
      } else {
        e.stopPropagation();
      }
      const activeSrc = button.dataset.heartActiveSrc || icon.dataset.heartActiveSrc || './img/icon/heart-black.svg';
      const inactiveSrc = button.dataset.heartInactiveSrc || icon.dataset.heartInactiveSrc || './img/icon/heart.svg';
      const current = icon.getAttribute('src') || '';
      const next = current.includes('heart-black.svg') ? inactiveSrc : activeSrc;
      icon.setAttribute('src', next);
      const pressed = button.getAttribute('aria-pressed') === 'true';
      button.setAttribute('aria-pressed', (!pressed).toString());
    });

    button.dataset.heartBound = 'true';
  }

  bindButton(button) {
    if (button.dataset.heartBound === 'true') return;
    const icon = button.querySelector('[data-heart-icon]') || button.querySelector('img');
    if (!icon) return;

    const activeSrc = button.dataset.heartActiveSrc || icon.dataset.heartActiveSrc || './img/icon/heart-black.svg';
    const inactiveSrc = button.dataset.heartInactiveSrc || icon.dataset.heartInactiveSrc || './img/icon/heart.svg';

    button.setAttribute('aria-pressed', button.getAttribute('aria-pressed') || 'false');

    button.addEventListener('click', (e) => {
      const anchor = button.closest('a');
      if (anchor) {
        e.preventDefault();
        e.stopPropagation();
      } else {
        e.stopPropagation();
      }
      const current = icon.getAttribute('src') || '';
      const isActive = current.includes('heart-black.svg') || current.endsWith(activeSrc);
      icon.setAttribute('src', isActive ? inactiveSrc : activeSrc);
      const pressed = button.getAttribute('aria-pressed') === 'true';
      button.setAttribute('aria-pressed', (!pressed).toString());
    });

    button.dataset.heartBound = 'true';
  }

  static init() {
    return new HeartToggle();
  }
}

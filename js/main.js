
// Clase reutilizable para manejar dropdowns
class DropdownManager {
  constructor() {
    this.dropdowns = [];
    this.activeDropdown = null;
  }

  // Método estático para inicializar todos los dropdowns
  static init() {
    const manager = new DropdownManager();
    manager.initializeDropdowns();
    
    // Agregar event listeners globales
    document.addEventListener('keydown', (e) => manager.handleKeydown(e));
    document.addEventListener('click', (e) => manager.handleClickOutside(e));
    
    // Cerrar dropdowns cuando se abre el nav móvil
    const mobileNavToggle = document.querySelector('[data-mobile-nav-toggle]');
    if (mobileNavToggle) {
      mobileNavToggle.addEventListener('click', () => {
        manager.closeAllDropdowns();
      });
    }

    // Cerrar dropdowns cuando se abre el buscador
    const searchToggle = document.querySelector('[data-search-toggle]');
    if (searchToggle) {
      searchToggle.addEventListener('click', () => {
        manager.closeAllDropdowns();
      });
    }
    
    return manager;
  }

  // Inicializar todos los dropdowns en la página
  initializeDropdowns() {
    const dropdownElements = document.querySelectorAll('[data-dropdown]');
    
    dropdownElements.forEach(element => {
      this.createDropdown(element);
    });

    // Cerrar dropdowns al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!e.target.closest('[data-dropdown]')) {
        this.closeAllDropdowns();
      }
    });

    // Cerrar dropdowns al presionar Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllDropdowns();
      }
    });
  }

  // Crear un dropdown individual
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
      isOpen: false
    };

    this.dropdowns.push(dropdown);

    // Agregar event listener al trigger
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleDropdown(dropdown);
    });

    // Agregar event listener al botón de cerrar
    if (closeButton) {
      closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeDropdown(dropdown);
      });
    }

    // Agregar event listeners a los enlaces del menú
    const menuLinks = menu.querySelectorAll('a');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.closeDropdown(dropdown);
      });
    });

    // Agregar event listeners a los elementos li del menú
    const menuItems = menu.querySelectorAll('li[data-value]');
    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        // Actualizar texto seleccionado si existe
        if (selected) {
          selected.textContent = item.textContent.trim();
        }
        
        // Disparar evento personalizado
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

  // Alternar estado del dropdown
  toggleDropdown(dropdown) {
    if (dropdown.isOpen) {
      this.closeDropdown(dropdown);
    } else {
      this.openDropdown(dropdown);
    }
  }

  // Abrir dropdown
  openDropdown(dropdown) {
    // Cerrar otros dropdowns abiertos
    this.closeAllDropdowns();

    // Abrir el dropdown actual
    dropdown.isOpen = true;
    dropdown.menu.style.display = 'flex';
    dropdown.element.classList.add('dropdown-open');

    // Rotar flecha si existe
    if (dropdown.arrow) {
      dropdown.arrow.classList.add('rotate-180');
    }

    // Cambiar íconos si existen
    if (dropdown.openIcon) {
      dropdown.openIcon.classList.add('hidden');
    }
    if (dropdown.closeIcon) {
      dropdown.closeIcon.classList.remove('hidden');
    }

    this.activeDropdown = dropdown;

    // Agregar clase al body para estilos globales
    document.body.classList.add('dropdown-active');
    
    // Solo bloquear scroll si es el dropdown del filtro (tiene botón de cerrar)
    if (dropdown.closeButton) {
      document.body.style.overflow = 'hidden';
    }
  }

  // Cerrar dropdown específico
  closeDropdown(dropdown) {
    dropdown.isOpen = false;
    dropdown.menu.style.display = 'none';
    dropdown.element.classList.remove('dropdown-open');

    // Restaurar flecha si existe
    if (dropdown.arrow) {
      dropdown.arrow.classList.remove('rotate-180');
    }

    // Restaurar íconos si existen
    if (dropdown.openIcon) {
      dropdown.openIcon.classList.remove('hidden');
    }
    if (dropdown.closeIcon) {
      dropdown.closeIcon.classList.add('hidden');
    }

    if (this.activeDropdown === dropdown) {
      this.activeDropdown = null;
      document.body.classList.remove('dropdown-active');
      
      // Solo restaurar scroll si era el dropdown del filtro (tenía botón de cerrar)
      if (dropdown.closeButton) {
        document.body.style.overflow = ''; // Restaurar scroll
      }
    }
  }

  // Cerrar todos los dropdowns
  closeAllDropdowns() {
    this.dropdowns.forEach(dropdown => {
      if (dropdown.isOpen) {
        dropdown.isOpen = false;
        dropdown.menu.style.display = 'none';
        dropdown.element.classList.remove('dropdown-open');

        // Restaurar flecha si existe
        if (dropdown.arrow) {
          dropdown.arrow.classList.remove('rotate-180');
        }

        // Restaurar íconos si existen
        if (dropdown.openIcon) {
          dropdown.openIcon.classList.remove('hidden');
        }
        if (dropdown.closeIcon) {
          dropdown.closeIcon.classList.add('hidden');
        }
      }
    });
    
    // Limpiar estado global
    this.activeDropdown = null;
    document.body.classList.remove('dropdown-active');
    document.body.style.overflow = ''; // Restaurar scroll
  }

  // Método público para cerrar todos los dropdowns
  closeAll() {
    this.closeAllDropdowns();
  }

  // Manejar tecla Escape
  handleKeydown(event) {
    if (event.key === 'Escape' && this.activeDropdown) {
      this.closeDropdown(this.activeDropdown);
    }
  }

  // Manejar click fuera del dropdown
  handleClickOutside(event) {
    if (this.activeDropdown && !this.activeDropdown.element.contains(event.target)) {
      this.closeDropdown(this.activeDropdown);
    }
  }
}

// Clase para manejar contadores de cantidad
class QuantityCounter {
  constructor() {
    this.counters = [];
    this.initializeCounters();
  }

  // Inicializar todos los contadores en la página
  initializeCounters() {
    const counterElements = document.querySelectorAll('[data-quantity-counter]');
    
    counterElements.forEach(element => {
      this.createCounter(element);
    });
  }

  // Crear un contador individual
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

    // Actualizar display inicial
    this.updateDisplay(counter);

    // Event listeners
    minusBtn.addEventListener('click', () => {
      this.decrement(counter);
    });

    plusBtn.addEventListener('click', () => {
      this.increment(counter);
    });
  }

  // Decrementar cantidad
  decrement(counter) {
    if (counter.currentValue > counter.minValue) {
      counter.currentValue--;
      this.updateDisplay(counter);
      this.triggerChangeEvent(counter);
    }
  }

  // Incrementar cantidad
  increment(counter) {
    if (counter.currentValue < counter.maxValue) {
      counter.currentValue++;
      this.updateDisplay(counter);
      this.triggerChangeEvent(counter);
    }
  }

  // Actualizar display y estado de botones
  updateDisplay(counter) {
    counter.display.textContent = counter.currentValue;
    
    // Estado del botón menos
    if (counter.currentValue <= counter.minValue) {
      counter.minusBtn.classList.add('opacity-25', 'cursor-not-allowed', 'pointer-events-none');
      counter.minusBtn.disabled = true;
    } else {
      counter.minusBtn.classList.remove('opacity-25', 'cursor-not-allowed', 'pointer-events-none');
      counter.minusBtn.disabled = false;
    }

    // Estado del botón más
    if (counter.currentValue >= counter.maxValue) {
      counter.plusBtn.classList.add('opacity-25', 'cursor-not-allowed', 'pointer-events-none');
      counter.plusBtn.disabled = true;
    } else {
      counter.plusBtn.classList.remove('opacity-25', 'cursor-not-allowed', 'pointer-events-none');
      counter.plusBtn.disabled = false;
    }
  }

  // Disparar evento de cambio
  triggerChangeEvent(counter) {
    const event = new CustomEvent('quantityChange', {
      detail: {
        value: counter.currentValue,
        element: counter.element
      }
    });
    counter.element.dispatchEvent(event);
  }

  // Método estático para inicializar
  static init() {
    return new QuantityCounter();
  }
}

// Clase para manejar checkboxes personalizados
class CustomCheckbox {
  constructor() {
    this.checkboxes = [];
    this.initializeCheckboxes();
  }

  // Inicializar todos los checkboxes en la página
  initializeCheckboxes() {
    const checkboxElements = document.querySelectorAll('[data-checkbox]');
    
    checkboxElements.forEach(element => {
      this.createCheckbox(element);
    });
  }

  // Crear un checkbox individual
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

    // Actualizar display inicial
    this.updateDisplay(checkbox);

    // Event listeners
    input.addEventListener('change', () => {
      this.toggleCheckbox(checkbox);
    });

    // Click en el label también debe activar el checkbox
    if (label) {
      label.addEventListener('click', (e) => {
        e.preventDefault();
        input.checked = !input.checked;
        this.toggleCheckbox(checkbox);
      });
    }
  }

  // Alternar estado del checkbox
  toggleCheckbox(checkbox) {
    checkbox.isChecked = checkbox.input.checked;
    this.updateDisplay(checkbox);
    this.triggerChangeEvent(checkbox);
  }

  // Actualizar display visual
  updateDisplay(checkbox) {
    if (checkbox.isChecked) {
      // Estado seleccionado
      checkbox.display.classList.remove('border-[#687286]', 'bg-white');
      checkbox.display.classList.add('border-[#E4022C]', 'bg-[#E4022C]');
      
      if (checkbox.icon) {
        checkbox.icon.classList.remove('hidden');
      }
    } else {
      // Estado no seleccionado
      checkbox.display.classList.remove('border-[#E4022C]', 'bg-[#E4022C]');
      checkbox.display.classList.add('border-[#687286]', 'bg-white');
      
      if (checkbox.icon) {
        checkbox.icon.classList.add('hidden');
      }
    }
  }

  // Disparar evento de cambio
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

  // Método estático para inicializar
  static init() {
    return new CustomCheckbox();
  }
}


// Clase para manejar grupos de opciones estilo radio
class RadioGroup {
  constructor() {
    this.groups = [];
    this.initializeGroups();
  }

  // Inicializar todos los grupos en la página
  initializeGroups() {
    const groupElements = document.querySelectorAll('[data-radio-group]');

    groupElements.forEach(element => {
      this.createGroup(element);
    });
  }

  // Crear un grupo individual
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

    // Determinar opción inicial: marcada con data-selected o la primera
    const initialOption = optionElements.find(opt => opt.hasAttribute('data-selected')) || optionElements[0];
    this.setActiveOption(group, initialOption, false);

    // Eventos de click para cada opción
    optionElements.forEach(option => {
      option.addEventListener('click', () => {
        this.setActiveOption(group, option, true);
      });
    });

    this.groups.push(group);
  }

  // Establecer opción activa y actualizar estilos
  setActiveOption(group, optionToActivate, emitEvent = true) {
    if (!group || !optionToActivate) return;

    group.options.forEach(option => {
      const isActive = option === optionToActivate;

      // Reset/aplicación de estado según estilo
      if (group.style === 'icon') {
        // No tocar clases utilitarias del contenedor; solo aria y data-selected e íconos
      } else if (group.style === 'swatch') {
        option.classList.remove('border-[2px]', 'border-[#E4022C]');
      } else {
        option.classList.remove('border-[#E4022C]', 'text-[#E4022C]', 'bg-[#FFF1F0]', 'font-semibold');
        option.classList.remove('border-[#C6C8CC]', 'text-[#C6C8CC]', 'bg-transparent', 'font-light');
      }

      // Aplicar estado correspondiente
      if (group.style === 'icon') {
        // Solo manejo de aria/data-selected y alternar ícono
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

  // Método estático para inicializar
  static init() {
    return new RadioGroup();
  }
}

// Clase para manejar acordeones
class Accordion {
  constructor() {
    this.accordions = [];
    this.groups = new Map(); // key: HTMLElement del grupo, value: acordeones del grupo
    this.initializeAccordions();
  }

  // Inicializar todos los acordeones en la página
  initializeAccordions() {
    const accordionElements = document.querySelectorAll('[data-accordion]');
    
    accordionElements.forEach(element => {
      this.createAccordion(element);
    });
  }

  // Crear un acordeón individual
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

    // Registrar en su grupo si existe
    if (groupEl) {
      if (!this.groups.has(groupEl)) this.groups.set(groupEl, []);
      this.groups.get(groupEl).push(accordion);
    }

    // Event listener para el trigger
    trigger.addEventListener('click', () => {
      this.toggleAccordion(accordion);
    });

    // Estado inicial
    this.updateState(accordion);
  }

  // Alternar acordeón
  toggleAccordion(accordion) {
    const willOpen = !accordion.isOpen;

    // Si pertenece a un grupo y se abrirá, cerrar los demás del grupo
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

  // Actualizar estado visual
  updateState(accordion) {
    const { content, arrow, isOpen } = accordion;

    if (isOpen) {
      content.style.display = 'block';
      content.classList.remove('hidden');
      if (arrow) {
        // Flecha hacia arriba cuando está abierto
        arrow.classList.remove('rotate-180');
      }
    } else {
      content.style.display = 'none';
      content.classList.add('hidden');
      if (arrow) {
        // Flecha hacia abajo cuando está cerrado
        arrow.classList.add('rotate-180');
      }
    }
  }

  // Método estático para inicializar
  static init() {
    return new Accordion();
  }
}

// Clase para manejar componentes de búsqueda personalizados
class SearchInput {
  constructor() {
    this.searchInputs = [];
    this.initializeSearchInputs();
  }

  // Inicializar todos los componentes de búsqueda en la página
  initializeSearchInputs() {
    const searchElements = document.querySelectorAll('[data-search-input]');
    
    searchElements.forEach(element => {
      this.createSearchInput(element);
    });
  }

  // Crear un componente de búsqueda individual
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

    // Event listeners
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

    // Hover events
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

    // Clear button
    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        field.value = '';
        searchInput.hasValue = false;
        this.updateState(searchInput);
        field.focus();
      });
    }

    // Label click
    if (label) {
      label.addEventListener('click', () => {
        field.focus();
      });
    }

    // Click fuera del campo
    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        searchInput.isFocused = false;
        searchInput.isHovered = false;
        this.updateState(searchInput);
      }
    });

    // Estado inicial
    this.updateState(searchInput);
  }


  // Actualizar estado visual
  updateState(searchInput) {
    const { container, label, isFocused, hasValue, isHovered } = searchInput;

    // Reset todas las clases
    container.classList.remove('border-[#3C3B3B]', 'border-[#E4022C]', 'shadow-[0_0_0_3px_#E4022C]', 'search-focused', 'search-has-value');
    if (label) label.classList.remove('text-[#E4022C]');

    // Aplicar estado focus
    if (isFocused) {
      container.classList.add('border-[#E4022C]', 'shadow-[0_0_0_3px_#E4022C]', 'search-focused');
      if (label) label.classList.add('text-[#E4022C]');
    }
    // Aplicar estado hover (solo si no está en focus)
    else if (isHovered) {
      container.classList.add('border-[#3C3B3B]');
    }

    // Aplicar clase para label flotante cuando hay valor
    if (hasValue) {
      container.classList.add('search-has-value');
    }
  }

  // Disparar evento personalizado
  triggerEvent(eventType, searchInput) {
    const event = new CustomEvent(`search${eventType.charAt(0).toUpperCase() + eventType.slice(1)}`, {
      detail: {
        value: searchInput.field.value,
        element: searchInput.element
      }
    });
    searchInput.element.dispatchEvent(event);
  }

  // Método estático para inicializar
  static init() {
    return new SearchInput();
  }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Inicializar AOS
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 4000,
      once: false,
      offset: 100,
      easing: 'cubic-bezier(0.26, -0.08, 0.04, 1)'
    });
  }

  // Inicializar Swipers
  initializeSwipers();

  // Inicializar dropdowns
  DropdownManager.init();
  
  // Inicializar contadores de cantidad
  QuantityCounter.init();
  
  // Inicializar checkboxes personalizados
  CustomCheckbox.init();
  
  // Inicializar grupos radio personalizados
  RadioGroup.init();
  
  // Inicializar componentes de búsqueda
  SearchInput.init();

  // Inicializar campos genéricos
  FormField.init();

  // Inicializar acordeones
  Accordion.init();

  // Inicializar menú móvil
  MobileNav.init();

  // Inicializar buscador
  SearchToggle.init();

  // Inicializar tabs reutilizables
  Tabs.init();

  // Inicializar MicroModal (si está disponible)
  if (typeof MicroModal !== 'undefined') {
    MicroModal.init({
      disableScroll: true,
      openClass: 'is-open',
    });
  }

  // Inicializar encadenador de modales
  ModalChain.init();
});

// Función para inicializar todos los Swipers
function initializeSwipers() {
  // Inicializar Swiper para "Más destacados"
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

  // Inicializar Swiper para "Recomendados para ti"
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

  // Inicializar Swiper para "Lo más buscado"
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

  // Inicializar Swiper para Banner
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

  // Inicializar Swiper para Ofertas
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

  // Inicializar Swiper para Categorías
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

    // Cerrar cuando se abre el buscador
    const searchToggle = document.querySelector('[data-search-toggle]');
    if (searchToggle) {
      searchToggle.addEventListener('click', () => {
        if (this.isOpen) this.close();
      });
    }

    // Cerrar cuando se abre el carrito
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

// Clase para manejar el buscador (desktop y mobile)
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
    // Asegurar estado inicial correcto
    if (this.openIcon) this.openIcon.classList.remove('hidden');
    if (this.closeIcon) this.closeIcon.classList.add('hidden');
  }

  bindEvents() {
    if (!this.toggleButton || !this.panel) return;

    this.toggleButton.addEventListener('click', () => this.toggle());

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // No cerrar automáticamente al cambiar de tamaño - funciona en desktop y mobile

    // Cerrar al hacer click fuera del panel
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.panel.contains(e.target) && !this.toggleButton.contains(e.target)) {
        this.close();
      }
    });

    // Enfocar el input cuando se abre
    this.panel.addEventListener('transitionend', () => {
      if (this.isOpen && this.input) {
        this.input.focus();
      }
    });

    // Cerrar cuando se abre el nav móvil
    const mobileNavToggle = document.querySelector('[data-mobile-nav-toggle]');
    if (mobileNavToggle) {
      mobileNavToggle.addEventListener('click', () => {
        if (this.isOpen) this.close();
      });
    }

    // Cerrar cuando se abre el carrito
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
    
    // Mostrar X, ocultar ícono de búsqueda
    if (this.openIcon) this.openIcon.classList.add('hidden');
    if (this.closeIcon) this.closeIcon.classList.remove('hidden');
    
    document.body.classList.add('overflow-hidden');
    
    // Enfocar el input después de un pequeño delay para asegurar que el panel esté visible
    setTimeout(() => {
      if (this.input) this.input.focus();
    }, 100);
  }

  close() {
    this.isOpen = false;
    this.panel.classList.add('hidden');
    this.toggleButton.setAttribute('aria-expanded', 'false');
    
    // Mostrar ícono de búsqueda, ocultar X
    if (this.openIcon) this.openIcon.classList.remove('hidden');
    if (this.closeIcon) this.closeIcon.classList.add('hidden');
    
    document.body.classList.remove('overflow-hidden');
    
    // Limpiar el input al cerrar
    if (this.input) this.input.value = '';
  }

  static init() {
    return new SearchToggle();
  }
}

// Componente genérico para campos con label flotante y clear
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

    // Estado inicial forzado: activar (flotar label) sin foco
    if (element.dataset.fieldInitial === 'active' || field.isSelect) {
      field.hasValue = true;
    }

    // Eventos
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

    // Soporte para selects (y cambios en inputs)
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

    // Estado inicial
    this.updateState(field);
  }

  updateState(field) {
    const { container, label, isFocused, hasValue, isHovered, isSelect } = field;

    // Reset clases
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

// Encadenador de modales: cierra el actual y abre el siguiente indicado
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
          try { MicroModal.close(currentId); } catch (_) {}
          // Pequeño delay para permitir la animación de cierre antes de abrir el siguiente
          setTimeout(() => {
            try { MicroModal.show(nextId); } catch (_) {}
          }, 150);
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

// Clase para manejar tabs reutilizables
class Tabs {
  constructor() {
    this.instances = [];
    this.initialize();
  }

  // Buscar todos los contenedores de tabs
  initialize() {
    const containers = document.querySelectorAll('[data-tabs]');
    containers.forEach(container => this.createTabs(container));
  }

  // Crear una instancia de tabs por contenedor
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

    // Definir pestaña activa inicial
    const preset = triggers.find(btn => btn.getAttribute('aria-selected') === 'true');
    const initialTrigger = preset || triggers[0];
    this.setActive(instance, initialTrigger.dataset.tabTarget, false);

    // Eventos
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

  // Activar una pestaña por nombre
  setActive(instance, name, emit = true) {
    instance.activeName = name;

    // Actualizar triggers
    instance.triggers.forEach(btn => {
      const isActive = btn.dataset.tabTarget === name;
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      btn.setAttribute('tabindex', isActive ? '0' : '-1');

      // Cambiar ícono activo/inactivo si existe
      const icon = btn.querySelector('[data-tab-icon]');
      const activeSrc = btn.dataset.tabActiveSrc;
      const inactiveSrc = btn.dataset.tabInactiveSrc;
      if (icon && activeSrc && inactiveSrc) {
        icon.src = isActive ? activeSrc : inactiveSrc;
      }
    });

    // Actualizar panels
    instance.panels.forEach(panel => {
      const isActive = panel.getAttribute('data-tab-panel') === name;
      panel.hidden = !isActive;
      panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });

    // Evento personalizado
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

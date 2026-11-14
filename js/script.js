/* =========================================================
   TalentStream — script.js (versión 2)
   Contenido:
     1. Utilidades
     2. Menú hamburguesa
     3. Efectos de scroll (progreso, sombra, botón arriba)
     4. Enlace activo del menú
     5. Aparición de elementos al hacer scroll
     6. Contadores animados
     7. Texto rotativo de la portada
     8. Panel 3D que sigue el mouse
     9. Comparador antes / después
    10. Servicios con imagen (pestañas automáticas)
    11. Demo de lectura con IA
    12. Pasos interactivos de "Cómo funciona"
    13. Carrusel de la galería + visor ampliado
    14. Calculadora de ahorro
    15. Precios mensual / anual
    16. Formulario de contacto con validación
   ========================================================= */
'use strict';

/* ---------- 1. UTILIDADES ---------- */
const $ = (selector, contexto = document) => contexto.querySelector(selector);
const $$ = (selector, contexto = document) => [...contexto.querySelectorAll(selector)];
const formatoNumero = (n, decimales = 0) =>
  n.toLocaleString('es-CO', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
// Respeta a quien prefiere menos animaciones en su sistema
const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ---------- 2. MENÚ HAMBURGUESA ---------- */
const hamburguesa = $('#hamburguesa');
const navegacion = $('#navegacion');

function alternarMenu(abrir) {
  navegacion.classList.toggle('abierto', abrir);
  hamburguesa.classList.toggle('abierto', abrir);
  hamburguesa.setAttribute('aria-expanded', abrir);
  hamburguesa.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
}
hamburguesa.addEventListener('click', () => alternarMenu(!navegacion.classList.contains('abierto')));
$$('#navegacion a').forEach(enlace => enlace.addEventListener('click', () => alternarMenu(false)));


/* ---------- 3. EFECTOS DE SCROLL ---------- */
const barraProgreso = $('#progreso');
const menu = $('#menu');
const botonArriba = $('#arriba');

function alHacerScroll() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  barraProgreso.style.width = `${total > 0 ? (window.scrollY / total) * 100 : 0}%`;
  menu.classList.toggle('menu--sombra', window.scrollY > 20);
  botonArriba.classList.toggle('visible', window.scrollY > 700);
}
window.addEventListener('scroll', alHacerScroll, { passive: true });
alHacerScroll();


/* ---------- 4. ENLACE ACTIVO DEL MENÚ ---------- */
const enlacesMenu = $$('.menu__nav a:not(.btn)');
const observadorSecciones = new IntersectionObserver(entradas => {
  entradas.forEach(entrada => {
    if (!entrada.isIntersecting) return;
    enlacesMenu.forEach(enlace =>
      enlace.classList.toggle('activo', enlace.getAttribute('href') === `#${entrada.target.id}`));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
$$('main section[id]').forEach(seccion => observadorSecciones.observe(seccion));


/* ---------- 5. APARICIÓN AL HACER SCROLL ---------- */
const observadorRevelar = new IntersectionObserver(entradas => {
  entradas.forEach(entrada => {
    if (!entrada.isIntersecting) return;
    entrada.target.classList.add('visible');
    observadorRevelar.unobserve(entrada.target);
  });
}, { threshold: 0.12 });
$$('.revelar').forEach((elemento, i) => {
  elemento.style.transitionDelay = `${(i % 3) * 90}ms`;
  observadorRevelar.observe(elemento);
});


/* ---------- 6. CONTADORES ANIMADOS ---------- */
function animarContador(elemento) {
  const final = Number(elemento.dataset.hasta);
  if (menosMovimiento) { elemento.textContent = formatoNumero(final); return; }
  const duracion = 1600;
  const inicio = performance.now();
  function paso(ahora) {
    const progreso = Math.min((ahora - inicio) / duracion, 1);
    const suavizado = 1 - Math.pow(1 - progreso, 3);   // empieza rápido y frena al final
    elemento.textContent = formatoNumero(Math.round(final * suavizado));
    if (progreso < 1) requestAnimationFrame(paso);
  }
  requestAnimationFrame(paso);
}
const observadorContadores = new IntersectionObserver(entradas => {
  entradas.forEach(entrada => {
    if (!entrada.isIntersecting) return;
    animarContador(entrada.target);
    observadorContadores.unobserve(entrada.target);
  });
}, { threshold: 0.5 });
$$('.contador').forEach(c => observadorContadores.observe(c));


/* ---------- 7. TEXTO ROTATIVO DE LA PORTADA ---------- */
const frases = [
  'pymes que contratan con frecuencia',
  'agencias de selección',
  'equipos de talento humano',
  'empresas que quieren ordenar sus datos'
];
const rotador = $('#rotador-texto');
let fraseActual = 0;
setInterval(() => {
  rotador.style.opacity = 0;
  setTimeout(() => {
    fraseActual = (fraseActual + 1) % frases.length;
    rotador.textContent = frases[fraseActual];
    rotador.style.opacity = 1;
  }, 300);
}, 3000);


/* ---------- 8. PANEL 3D QUE SIGUE EL MOUSE ---------- */
const escena = $('#escena');
const panel3d = $('#panel3d');
if (!menosMovimiento && window.matchMedia('(hover: hover)').matches) {
  escena.addEventListener('mousemove', e => {
    const caja = escena.getBoundingClientRect();
    const x = (e.clientX - caja.left) / caja.width - 0.5;   // de -0,5 a 0,5
    const y = (e.clientY - caja.top) / caja.height - 0.5;
    panel3d.style.transform = `rotateY(${x * 16}deg) rotateX(${-y * 12}deg)`;
  });
  escena.addEventListener('mouseleave', () => { panel3d.style.transform = ''; });
}


/* ---------- 9. COMPARADOR ANTES / DESPUÉS ---------- */
const rangoComparador = $('#comparador-rango');
function actualizarComparador() {
  const valor = rangoComparador.value;
  $('#comparador-despues').style.clipPath = `inset(0 0 0 ${valor}%)`;
  $('#comparador-control').style.left = `${valor}%`;
}
rangoComparador.addEventListener('input', actualizarComparador);
actualizarComparador();


/* ---------- 10. SERVICIOS CON IMAGEN ---------- */
const botonesServicio = $$('.servicio');
const imagenServicio = $('#servicio-img');
const progresoServicio = $('#servicio-progreso');
const DURACION_SERVICIO = 5000;   // cada servicio se muestra 5 segundos
let servicioActual = 0;
let temporizadorServicio = null;

function mostrarServicio(indice) {
  servicioActual = indice;
  botonesServicio.forEach((b, i) => {
    b.classList.toggle('activo', i === indice);
    b.setAttribute('aria-selected', i === indice);
  });
  const boton = botonesServicio[indice];
  imagenServicio.classList.add('cambiando');
  setTimeout(() => {
    imagenServicio.src = boton.dataset.img;
    imagenServicio.alt = boton.dataset.alt;
    imagenServicio.classList.remove('cambiando');
  }, 250);

  // Reinicia la barra de tiempo
  progresoServicio.style.transition = 'none';
  progresoServicio.style.width = '0';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    progresoServicio.style.transition = `width ${DURACION_SERVICIO}ms linear`;
    progresoServicio.style.width = '100%';
  }));

  clearTimeout(temporizadorServicio);
  temporizadorServicio = setTimeout(() => mostrarServicio((servicioActual + 1) % botonesServicio.length), DURACION_SERVICIO);
}
botonesServicio.forEach((boton, i) => boton.addEventListener('click', () => mostrarServicio(i)));
// Empieza a rotar solo cuando la sección es visible
new IntersectionObserver((entradas, obs) => {
  if (entradas[0].isIntersecting) { mostrarServicio(0); obs.disconnect(); }
}, { threshold: 0.3 }).observe($('#servicios'));


/* ---------- 11. DEMO DE LECTURA CON IA ---------- */
const ejemplosCV = [
`Laura Patricia Gómez Ríos
Bogotá D.C. | laura.gomez@correo.com | +57 310 456 7890

PERFIL
Contadora pública con 4 años de experiencia en liquidación de nómina
y seguridad social.

FORMACIÓN
Profesional en Contaduría Pública
Especialización en Gerencia Tributaria

HABILIDADES
Excel avanzado, Nómina, SAP, Trabajo en equipo, Comunicación.`,
`Andrés Felipe Morales
Medellín | andres.morales@correo.co | 315 222 3344

Tecnólogo en Análisis y Desarrollo de Software.
Experiencia de 2 años como desarrollador web junior.

Habilidades: JavaScript, HTML, CSS, Git, SQL, Inglés.`,
`Diana Marcela Torres
Cali, Valle | dmtorres@correo.com | (602) 555 1234

Técnica en Logística con 6 años de experiencia en bodega,
manejo de inventarios y montacargas.

Competencias: Inventarios, Logística, Trabajo en equipo, Excel.`
];
const HABILIDADES = ['Excel', 'Nómina', 'SAP', 'Contabilidad', 'JavaScript', 'HTML', 'CSS', 'Git', 'SQL', 'Python',
  'Inglés', 'Inventarios', 'Logística', 'Montacargas', 'Ventas', 'Atención al cliente', 'Trabajo en equipo',
  'Comunicación', 'Liderazgo', 'Power BI', 'Seguridad social'];

let ejemploActual = 0;
const textoDemo = $('#demo-texto');
textoDemo.value = ejemplosCV[0];

const sinTildes = t => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Busca patrones en el texto: es una ayuda, una persona debe revisar el resultado
function extraerDatos(texto) {
  const plano = sinTildes(texto);
  const primeraLinea = texto.split('\n').map(l => l.trim()).find(Boolean) || '';
  const experiencia = plano.match(/(\d{1,2})\s*anos?\s+(de\s+)?experiencia/) || plano.match(/experiencia\s*(de|:)?\s*(\d{1,2})\s*anos?/);
  const niveles = [
    ['Doctorado', /doctorado/], ['Maestría', /maestria|magister/], ['Especialización', /especializacion/],
    ['Profesional', /profesional|ingenier|contador|licenciad|pregrado/], ['Tecnólogo', /tecnolog/],
    ['Técnico', /tecnic/], ['Bachiller', /bachiller/]
  ];
  const formacion = niveles.find(([, patron]) => patron.test(plano));
  const telefono = texto.match(/(\+?57[\s-]?)?(\(?60\d\)?|3\d{2})[\s-]?\d{3}[\s-]?\d{4}/);
  return {
    nombre: primeraLinea.split(/\s+/).length <= 6 && !/[@\d|]/.test(primeraLinea) ? primeraLinea : '',
    correo: (texto.match(/[\w.+-]+@[\w-]+(\.[\w-]+)+/) || [''])[0],
    telefono: telefono ? telefono[0].trim() : '',
    formacion: formacion ? formacion[0] : '',
    experiencia: experiencia ? `${/^\d+$/.test(experiencia[1]) ? experiencia[1] : experiencia[2]} años` : '',
    habilidades: HABILIDADES.filter(h => new RegExp(`(^|[^a-z])${sinTildes(h)}([^a-z]|$)`).test(plano)).join(' · ')
  };
}

const botonAnalizar = $('#demo-analizar');
const estadoDemo = $('#demo-estado');

botonAnalizar.addEventListener('click', () => {
  const items = $$('#demo-datos li');
  items.forEach(li => { li.classList.remove('lleno', 'vacio'); $('b', li).textContent = '—'; });
  botonAnalizar.disabled = true;
  estadoDemo.textContent = 'Analizando…';
  estadoDemo.className = 'pildora pildora--trabajando';

  const escaner = $('#demo-escaner');
  escaner.classList.remove('activo');
  void escaner.offsetWidth;            // reinicia la animación
  escaner.classList.add('activo');

  const datos = extraerDatos(textoDemo.value);
  setTimeout(() => {
    // Muestra los datos uno por uno
    items.forEach((li, i) => {
      setTimeout(() => {
        const valor = datos[li.dataset.campo];
        $('b', li).textContent = valor || 'No encontrado: completar a mano';
        li.classList.add(valor ? 'lleno' : 'vacio');
        if (i === items.length - 1) {
          const encontrados = Object.values(datos).filter(Boolean).length;
          estadoDemo.textContent = `${encontrados} de 6 datos · revisar`;
          estadoDemo.className = 'pildora pildora--ok';
          botonAnalizar.disabled = false;
        }
      }, i * 220);
    });
  }, menosMovimiento ? 0 : 1400);
});

$('#demo-ejemplo').addEventListener('click', () => {
  ejemploActual = (ejemploActual + 1) % ejemplosCV.length;
  textoDemo.value = ejemplosCV[ejemploActual];
  $$('#demo-datos li').forEach(li => { li.classList.remove('lleno', 'vacio'); $('b', li).textContent = '—'; });
  estadoDemo.textContent = 'Esperando…';
  estadoDemo.className = 'pildora';
});


/* ---------- 12. PASOS INTERACTIVOS ---------- */
const infoPasos = [
  { img: 'img/servicio-recepcion.jpg', titulo: 'Recibe todas las candidaturas', texto: 'Cada hoja de vida queda registrada en su vacante, sin correos perdidos ni archivos duplicados.' },
  { img: 'img/servicio-lectura.jpg', titulo: 'Organiza la información con IA', texto: 'La IA extrae los datos clave de la hoja de vida y una persona de tu equipo los revisa y confirma.' },
  { img: 'img/servicio-validacion.jpg', titulo: 'Evalúa contra los requisitos', texto: 'El sistema compara el perfil con el cargo y el candidato avanza por etapas con historial de fecha y hora.' },
  { img: 'img/servicio-entrevistas.jpg', titulo: 'Decide con información', texto: 'Programa entrevistas, registra resultados y apóyate en indicadores para elegir al mejor perfil.' }
];
const botonesPaso = $$('.paso');
const imagenPaso = $('#paso-img');

function mostrarPaso(indice) {
  botonesPaso.forEach((b, i) => {
    b.classList.toggle('activo', i === indice);
    b.classList.toggle('hecho', i < indice);
  });
  $('#pasos-avance').style.width = `${(indice / (botonesPaso.length - 1)) * 100}%`;
  const info = infoPasos[indice];
  imagenPaso.classList.add('cambiando');
  setTimeout(() => {
    imagenPaso.src = info.img;
    imagenPaso.alt = info.titulo;
    imagenPaso.classList.remove('cambiando');
  }, 200);
  $('#paso-num').textContent = `Paso ${indice + 1}`;
  $('#paso-titulo').textContent = info.titulo;
  $('#paso-texto').textContent = info.texto;
}
botonesPaso.forEach((boton, i) => boton.addEventListener('click', () => mostrarPaso(i)));


/* ---------- 13. CARRUSEL + VISOR AMPLIADO ---------- */
const carrusel = $('#carrusel');
const pista = $('#carrusel-pista');
const figuras = $$('figure', pista);
const contenedorPuntos = $('#carrusel-puntos');
let indiceCarrusel = 0;
let autoCarrusel = null;

// Cuántas imágenes caben a la vez según el ancho de pantalla
const porVista = () => Math.max(1, Math.round(carrusel.clientWidth / figuras[0].getBoundingClientRect().width));
const maximoIndice = () => Math.max(0, figuras.length - porVista());

function crearPuntos() {
  contenedorPuntos.innerHTML = '';
  for (let i = 0; i <= maximoIndice(); i++) {
    const punto = document.createElement('button');
    punto.setAttribute('aria-label', `Ir a la imagen ${i + 1}`);
    punto.addEventListener('click', () => irA(i));
    contenedorPuntos.appendChild(punto);
  }
}

function irA(indice) {
  const max = maximoIndice();
  indiceCarrusel = indice > max ? 0 : indice < 0 ? max : indice;   // da la vuelta al llegar al final
  const desplazamiento = figuras[indiceCarrusel].offsetLeft;
  pista.style.transform = `translateX(${-desplazamiento}px)`;
  $$('button', contenedorPuntos).forEach((p, i) => p.classList.toggle('activo', i === indiceCarrusel));
  reiniciarAuto();
}

function reiniciarAuto() {
  clearInterval(autoCarrusel);
  if (!menosMovimiento) autoCarrusel = setInterval(() => irA(indiceCarrusel + 1), 4500);
}

$('#galeria-prev').addEventListener('click', () => irA(indiceCarrusel - 1));
$('#galeria-next').addEventListener('click', () => irA(indiceCarrusel + 1));
carrusel.addEventListener('mouseenter', () => clearInterval(autoCarrusel));
carrusel.addEventListener('mouseleave', reiniciarAuto);

// Arrastrar con el mouse o deslizar con el dedo
let inicioX = 0, movido = 0, arrastrando = false;
carrusel.addEventListener('pointerdown', e => {
  arrastrando = true; movido = 0; inicioX = e.clientX;
  carrusel.classList.add('arrastrando');
});
window.addEventListener('pointermove', e => {
  if (!arrastrando) return;
  movido = e.clientX - inicioX;
  pista.style.transform = `translateX(${-figuras[indiceCarrusel].offsetLeft + movido}px)`;
});
function soltar() {
  if (!arrastrando) return;
  arrastrando = false;
  carrusel.classList.remove('arrastrando');
  if (movido < -60) irA(indiceCarrusel + 1);
  else if (movido > 60) irA(indiceCarrusel - 1);
  else irA(indiceCarrusel);
}
window.addEventListener('pointerup', soltar);
window.addEventListener('pointercancel', soltar);

// Visor ampliado con flechas
const visor = $('#visor');
let indiceVisor = 0;
function abrirVisor(indice) {
  indiceVisor = (indice + figuras.length) % figuras.length;
  const figura = figuras[indiceVisor];
  $('#visor-img').src = $('img', figura).src;
  $('#visor-img').alt = $('img', figura).alt;
  $('#visor-texto').textContent = `${$('figcaption', figura).textContent} (${indiceVisor + 1}/${figuras.length})`;
  visor.hidden = false;
  document.body.style.overflow = 'hidden';
  clearInterval(autoCarrusel);
}
function cerrarVisor() {
  visor.hidden = true;
  document.body.style.overflow = '';
  reiniciarAuto();
}
figuras.forEach((figura, i) => figura.addEventListener('click', () => {
  if (Math.abs(movido) < 6) abrirVisor(i);   // si fue arrastre, no abre
}));
$('#visor-cerrar').addEventListener('click', cerrarVisor);
$('#visor-prev').addEventListener('click', () => abrirVisor(indiceVisor - 1));
$('#visor-next').addEventListener('click', () => abrirVisor(indiceVisor + 1));
visor.addEventListener('click', e => { if (e.target === visor) cerrarVisor(); });
document.addEventListener('keydown', e => {
  if (visor.hidden) return;
  if (e.key === 'Escape') cerrarVisor();
  if (e.key === 'ArrowLeft') abrirVisor(indiceVisor - 1);
  if (e.key === 'ArrowRight') abrirVisor(indiceVisor + 1);
});

crearPuntos();
irA(0);
let temporizadorResize;
window.addEventListener('resize', () => {
  clearTimeout(temporizadorResize);
  temporizadorResize = setTimeout(() => { crearPuntos(); irA(Math.min(indiceCarrusel, maximoIndice())); }, 150);
});


/* ---------- 14. CALCULADORA DE AHORRO ---------- */
// Supuesto editable: la automatización reduce el tiempo de revisión en el % elegido.
function calcularAhorro() {
  const hojas = Number($('#c-hojas').value);
  const minutos = Number($('#c-minutos').value);
  const ahorro = Number($('#c-ahorro').value) / 100;

  const horasManual = (hojas * minutos) / 60;
  const horasConTS = horasManual * (1 - ahorro);
  const horasLiberadas = horasManual - horasConTS;

  $('#v-hojas').textContent = hojas;
  $('#v-minutos').textContent = minutos;
  $('#v-ahorro').textContent = `${Math.round(ahorro * 100)} %`;
  $('#r-horas').textContent = formatoNumero(horasLiberadas, 1);
  $('#r-dias').textContent = formatoNumero(horasLiberadas / 8, 1);
  $('#r-antes').textContent = `${formatoNumero(horasManual, 1)} h`;
  $('#r-despues').textContent = `${formatoNumero(horasConTS, 1)} h`;
  $('#b-despues').style.width = `${(1 - ahorro) * 100}%`;
}
['#c-hojas', '#c-minutos', '#c-ahorro'].forEach(id => $(id).addEventListener('input', calcularAhorro));
calcularAhorro();


/* ---------- 15. PRECIOS MENSUAL / ANUAL ---------- */
const DESCUENTO_ANUAL = 0.15;
$$('.selector-pago button').forEach(boton => {
  boton.addEventListener('click', () => {
    $$('.selector-pago button').forEach(b => b.classList.remove('activo'));
    boton.classList.add('activo');
    const anual = boton.dataset.pago === 'anual';
    $$('[data-precio]').forEach(precio => {
      const mensual = Number(precio.dataset.precio);
      precio.textContent = '$' + formatoNumero(Math.round(anual ? mensual * (1 - DESCUENTO_ANUAL) : mensual));
      precio.nextElementSibling.textContent = anual ? '/mes, pago anual' : '/mes';
      precio.classList.add('salto');
      setTimeout(() => precio.classList.remove('salto'), 300);
    });
  });
});

// Los botones de plan preseleccionan la opción en el formulario
$$('[data-plan]').forEach(boton => boton.addEventListener('click', () => { $('#plan').value = boton.dataset.plan; }));


/* ---------- 16. FORMULARIO DE CONTACTO ---------- */
const formulario = $('#formulario');
const mensajeExito = $('#exito');

const reglas = {
  nombre: v => !v.trim() ? 'Escribe tu nombre.'
    : v.trim().length < 3 ? 'El nombre es muy corto.'
    : !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]+$/.test(v.trim()) ? 'El nombre solo puede tener letras.' : '',
  correo: v => !v.trim() ? 'Escribe tu correo.'
    : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'El correo no es válido (ej.: nombre@empresa.com).' : '',
  telefono: v => !v.trim() ? ''
    : !/^(57)?\d{10}$/.test(v.replace(/[\s()+-]/g, '')) ? 'Escribe un número de 10 dígitos.' : '',
  empresa: v => v.trim() ? '' : 'Escribe el nombre de tu empresa.',
  mensaje: v => !v.trim() ? 'Cuéntanos qué necesitas.'
    : v.trim().length < 10 ? 'El mensaje debe tener al menos 10 caracteres.' : '',
  acepto: (_, campo) => campo.checked ? '' : 'Debes autorizar el tratamiento de datos.'
};

function validarCampo(campo) {
  const regla = reglas[campo.name];
  if (!regla) return true;
  const error = regla(campo.value, campo);
  const contenedor = campo.closest('.campo');
  $('.error', contenedor).textContent = error;
  contenedor.classList.toggle('invalido', Boolean(error));
  contenedor.classList.toggle('valido', !error && campo.type !== 'checkbox' && campo.value.trim() !== '');
  return !error;
}

$$('input, textarea', formulario).forEach(campo => {
  campo.addEventListener('blur', () => validarCampo(campo));
  campo.addEventListener('input', () => { if (campo.closest('.campo').classList.contains('invalido')) validarCampo(campo); });
});
$('#acepto').addEventListener('change', e => validarCampo(e.target));

formulario.addEventListener('submit', evento => {
  evento.preventDefault();
  mensajeExito.hidden = true;
  const validos = $$('input, textarea', formulario).map(validarCampo);
  if (validos.includes(false)) {
    $('.campo.invalido input, .campo.invalido textarea', formulario)?.focus();
    return;
  }
  // Página estática: no hay servidor, se simula el envío y se confirma
  const boton = $('#btn-enviar');
  boton.disabled = true;
  boton.textContent = 'Enviando…';
  setTimeout(() => {
    const nombre = $('#nombre').value.trim().split(' ')[0];
    mensajeExito.textContent = `¡Gracias, ${nombre}! Recibimos tu solicitud para el plan ${$('#plan').value}. Te contactaremos en menos de 24 horas hábiles.`;
    mensajeExito.hidden = false;
    formulario.reset();
    $$('.campo', formulario).forEach(c => c.classList.remove('valido', 'invalido'));
    boton.disabled = false;
    boton.textContent = 'Enviar solicitud';
  }, 900);
});

// Año actual en el pie de página
$('#anio').textContent = new Date().getFullYear();

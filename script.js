// Detectar dispositivo
const isMobileDevice = () => {
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    (navigator.userAgent || navigator.vendor || window.opera).toLowerCase()
  );
};

// Función para inicializar la animación del corazón
const initHeartAnimation = () => {
  window.requestAnimationFrame =
    window.__requestAnimationFrame ||
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    (function () {
      return function (callback, element) {
        var lastTime = element.__lastTime;
        if (lastTime === undefined) {
          lastTime = 0;
        }
        var currTime = Date.now();
        var timeToCall = Math.max(1, 33 - (currTime - lastTime));
        window.setTimeout(callback, timeToCall);
        element.__lastTime = currTime + timeToCall;
      };
    })();

  window.isDevice = isMobileDevice();
  var loaded = false;
  var init = function () {
    if (loaded) return;
    loaded = true;
    var mobile = window.isDevice;
    var koef = mobile ? 0.5 : 1;
    var canvas = document.getElementById("heart");
    var ctx = canvas.getContext("2d");
    var width = (canvas.width = koef * innerWidth);
    var height = (canvas.height = koef * innerHeight);
    var rand = Math.random;
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0, 0, width, height);

    var heartPosition = function (rad) {
      return [
        Math.pow(Math.sin(rad), 3),
        -(
          15 * Math.cos(rad) -
          5 * Math.cos(2 * rad) -
          2 * Math.cos(3 * rad) -
          Math.cos(4 * rad)
        ),
      ];
    };
    var scaleAndTranslate = function (pos, sx, sy, dx, dy) {
      return [dx + pos[0] * sx, dy + pos[1] * sy];
    };

    window.addEventListener("resize", function () {
      width = canvas.width = koef * innerWidth;
      height = canvas.height = koef * innerHeight;
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillRect(0, 0, width, height);
    });

    var traceCount = mobile ? 20 : 50;
    var pointsOrigin = [];
    var i;
    var dr = mobile ? 0.3 : 0.1;
    for (i = 0; i < Math.PI * 2; i += dr)
      pointsOrigin.push(scaleAndTranslate(heartPosition(i), 210, 13, 0, 0));
    for (i = 0; i < Math.PI * 2; i += dr)
      pointsOrigin.push(scaleAndTranslate(heartPosition(i), 150, 9, 0, 0));
    for (i = 0; i < Math.PI * 2; i += dr)
      pointsOrigin.push(scaleAndTranslate(heartPosition(i), 90, 5, 0, 0));
    var heartPointsCount = pointsOrigin.length;

    var targetPoints = [];
    var pulse = function (kx, ky) {
      for (i = 0; i < pointsOrigin.length; i++) {
        targetPoints[i] = [];
        targetPoints[i][0] = kx * pointsOrigin[i][0] + width / 2;
        targetPoints[i][1] = ky * pointsOrigin[i][1] + height / 2;
      }
    };

    var e = [];
    for (i = 0; i < heartPointsCount; i++) {
      var x = rand() * width;
      var y = rand() * height;
      e[i] = {
        vx: 0,
        vy: 0,
        R: 2,
        speed: rand() + 5,
        q: ~~(rand() * heartPointsCount),
        D: 2 * (i % 2) - 1,
        force: 0.2 * rand() + 0.7,
        f:
          "hsla(0," +
          ~~(40 * rand() + 60) +
          "%," +
          ~~(60 * rand() + 20) +
          "%,.3)",
        trace: [],
      };
      for (var k = 0; k < traceCount; k++) e[i].trace[k] = { x: x, y: y };
    }

    var config = {
      traceK: 0.4,
      timeDelta: 0.01,
    };

    var time = 0;
    var loop = function () {
      var n = -Math.cos(time);
      pulse((1 + n) * 0.5, (1 + n) * 0.5);
      time += (Math.sin(time) < 0 ? 9 : n > 0.8 ? 0.2 : 1) * config.timeDelta;
      ctx.fillStyle = "rgba(0,0,0,.1)";
      ctx.fillRect(0, 0, width, height);
      for (i = e.length; i--; ) {
        var u = e[i];
        var q = targetPoints[u.q];
        var dx = u.trace[0].x - q[0];
        var dy = u.trace[0].y - q[1];
        var length = Math.sqrt(dx * dx + dy * dy);
        if (10 > length) {
          if (0.95 < rand()) {
            u.q = ~~(rand() * heartPointsCount);
          } else {
            if (0.99 < rand()) {
              u.D *= -1;
            }
            u.q += u.D;
            u.q %= heartPointsCount;
            if (0 > u.q) {
              u.q += heartPointsCount;
            }
          }
        }
        u.vx += (-dx / length) * u.speed;
        u.vy += (-dy / length) * u.speed;
        u.trace[0].x += u.vx;
        u.trace[0].y += u.vy;
        u.vx *= u.force;
        u.vy *= u.force;
        for (k = 0; k < u.trace.length - 1; ) {
          var T = u.trace[k];
          var N = u.trace[++k];
          N.x -= config.traceK * (N.x - T.x);
          N.y -= config.traceK * (N.y - T.y);
        }
        ctx.fillStyle = u.f;
        for (k = 0; k < u.trace.length; k++) {
          ctx.fillRect(u.trace[k].x, u.trace[k].y, 1, 1);
        }
      }

      window.requestAnimationFrame(loop, canvas);
    };
    loop();
  };

  var s = document.readyState;
  if (s === "complete" || s === "loaded" || s === "interactive") init();
  else document.addEventListener("DOMContentLoaded", init, false);
};

// Esperar a que el DOM esté completamente listo
document.addEventListener("DOMContentLoaded", function () {
  const btnNo = document.getElementById("btnNo");
  const btnSi = document.getElementById("btnSi");

  // Array de mensajes para cuando hace click en "No"
  const mensajesNo = [
    "Vamos, sé que quieres ser mi novia",
    "Vivamos una linda historia juntos",
    "Vamos, di que sí",
    "No me digas que no...",
    "Seré el mejor novio del mundo",
    "Te lo prometo, seré muy feliz contigo"
  ];

  // Movimiento del botón "No" en desktop
  if (!isMobileDevice()) {
    btnNo.style.transition = "transform 0.05s ease-in-out";
    btnNo.addEventListener("mouseover", function () {
      const nuevaX = Math.random() * 450 - 225;
      const nuevaY = Math.random() * -300 - 50;
      this.style.transform = `translate(${nuevaX}px, ${nuevaY}px)`;
    });
    btnNo.addEventListener("mouseleave", function () {
      this.style.transform = "translate(0, 0)";
    });
  } else {
    // En mobile, hacer que el botón se mueva cuando se toca
    btnNo.addEventListener("touchstart", function (e) {
      e.preventDefault();
      const nuevaX = Math.random() * 300 - 150;
      const nuevaY = Math.random() * -200 - 30;
      this.style.transform = `translate(${nuevaX}px, ${nuevaY}px)`;
    });
    btnNo.addEventListener("touchend", function () {
      this.style.transform = "translate(0, 0)";
    });
  }

  // Evento del botón Sí
  btnSi.addEventListener("click", function () {
    Swal.fire({
      position: "top-center",
      icon: "success",
      title: "¡Soy el hombre más feliz del mundo! 🥰",
      html: "<p style='font-size: 16px; line-height: 1.6;'>Me has dado la oportunidad más maravillosa que jamás podría haber soñado. Gracias por aceptar ser mi novia, mi compañera de vida, mi amor. Prometo amarte, cuidarte y hacer que cada día sea especial a tu lado. Este es solo el comienzo de nuestra bella historia de amor. ❤️</p>",
      showConfirmButton: true,
      confirmButtonText: "Te amo",
      confirmButtonColor: "#00ff00",
      backdrop: true,
    });

    var pregunta = document.getElementById("pregunta");
    pregunta.textContent = "El inicio de una hermosa historia ha comenzado... 💕";
    btnNo.style.display = "none";

    // Inicializar animación del corazón
    initHeartAnimation();
  });

  // Evento del botón No
  btnNo.addEventListener("click", function (e) {
    e.preventDefault();
    const mensajeAleatorio = mensajesNo[Math.floor(Math.random() * mensajesNo.length)];
    
    Swal.fire({
      position: "center",
      icon: "question",
      title: mensajeAleatorio,
      html: "<p style='font-size: clamp(14px, 3vw, 18px); line-height: 1.6;'>🥺 Por favor, reconsideralo...</p>",
      allowOutsideClick: false,
      allowEscapeKey: false,
      confirmButtonText: "Dijiste que SÍ",
      confirmButtonColor: "#00ff00",
      backdrop: true,
      didOpen: function(modal) {
        const popup = modal.querySelector('.swal2-popup');
        popup.style.width = 'clamp(250px, 90vw, 500px)';
        popup.style.padding = 'clamp(20px, 5vw, 40px)';
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Mostrar alerta final para que diga que sí
        Swal.fire({
          position: "center",
          icon: "info",
          title: "¿Entonces... es un SÍ? 💕",
          html: "<p style='font-size: clamp(14px, 3vw, 18px); line-height: 1.6;'>¡Dime que sí y haz que sea el hombre más feliz del mundo!</p>",
          allowOutsideClick: false,
          allowEscapeKey: false,
          confirmButtonText: "¡SÍ, QUIERO SER TU NOVIA! 💖",
          confirmButtonColor: "#00ff00",
          backdrop: true,
          didOpen: function(modal) {
            const popup = modal.querySelector('.swal2-popup');
            popup.style.width = 'clamp(250px, 90vw, 500px)';
            popup.style.padding = 'clamp(20px, 5vw, 40px)';
          }
        }).then((finalResult) => {
          if (finalResult.isConfirmed) {
            // Ejecutar el evento del botón Sí
            btnSi.click();
          }
        });
      }
    });
  });

  // Evento del botón Sí
  btnSi.addEventListener("click", function () {
    Swal.fire({
      position: "top-center",
      icon: "success",
      title: "¡Soy el hombre más feliz del mundo! 🥰",
      html: "<p style='font-size: 16px; line-height: 1.6;'>Me has dado la oportunidad más maravillosa que jamás podría haber soñado. Gracias por aceptar ser mi novia, mi compañera de vida, mi amor. Prometo amarte, cuidarte y hacer que cada día sea especial a tu lado. Este es solo el comienzo de nuestra bella historia de amor. ❤️</p>",
      showConfirmButton: true,
      confirmButtonText: "Te amo",
      confirmButtonColor: "#00ff00",
      backdrop: true,
    });

    var pregunta = document.getElementById("pregunta");
    pregunta.textContent = "El inicio de una hermosa historia ha comenzado... 💕";
    btnNo.style.display = "none";

    // Inicializar animación del corazón
    initHeartAnimation();
  });
});

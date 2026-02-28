// ================== CONFIG ==================
    const archivos = {
     exe: "https://www.dropbox.com/scl/fi/ia6kr2yht71ktd04e4tlo/InstaladorDonVotex.exe?rlkey=pg2emnumfa3co883g3tteezrp&raw=1",
      // Reemplaza este link cuando tengas un parche real:
      parche: "https://www.dropbox.com/scl/fi/xxxxx/parche.exe?raw=1"
    };

    // ============ DESCARGAS GENERALES ============
    let descargaEnProgreso = false;

    function iniciarDescarga(tipo) {
      if (descargaEnProgreso) {
        alert("⏳ Espera que termine la descarga anterior.");
        return;
      }
      const url = archivos[tipo];
      if (!url) {
        alert("⚠️ Link no configurado.");
        return;
      }
      descargaEnProgreso = true;

      const barra = document.getElementById("barraCarga");
      const progreso = document.getElementById("progreso");
      const info = document.getElementById("info");

      barra.style.display = "block";
      progreso.style.width = "0%";
      info.textContent = "⏳ Preparando archivo...";

      let porcentaje = 0;
      const animacion = setInterval(() => {
        porcentaje += Math.random() * 18 + 5;
        if (porcentaje >= 100) porcentaje = 100;
        progreso.style.width = porcentaje + "%";
        info.textContent = `Descargando... ${Math.round(porcentaje)}%`;

        if (porcentaje >= 100) {
          clearInterval(animacion);
          info.textContent = "✔ Descarga iniciada";
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', '');
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          setTimeout(() => {
            barra.style.display = "none";
            info.textContent = "";
            descargaEnProgreso = false;
          }, 1600);
        }
      }, 110);
    }

    // ============ MODAL UTILIDADES ============
    const modal = document.getElementById("modalParche");
    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");
    const modalExtras = document.getElementById("modalExtras");
    const modalActions = document.getElementById("modalActions");
    const modalHint = document.getElementById("modalHint");

    function abrirModal() {
      modal.classList.add("activo");
      modal.setAttribute("aria-hidden", "false");
    }
    function cerrarModal() {
      modal.classList.remove("activo");
      modal.setAttribute("aria-hidden", "true");
      // Limpieza
      modalTitle.textContent = "";
      modalBody.innerHTML = "";
      modalExtras.innerHTML = "";
      modalActions.innerHTML = "";
      modalHint.textContent = "";
    }

    function estadoBuscando() {
      modalTitle.textContent = "Buscando parches";
      modalBody.innerHTML = `
        <div class="spinner" aria-hidden="true"></div>
        <div class="dots" aria-live="polite">Por favor espera</div>
      `;
      modalActions.innerHTML = `
        <button class="btn btn-rojo" id="btnCancelar">❌ Cancelar</button>
      `;
      document.getElementById("btnCancelar").onclick = cerrarModal;
      modalExtras.innerHTML = "";
      modalHint.textContent = "";
    }

    function estadoDecision() {
      modalTitle.textContent = "🔧 Parche disponible";
      modalBody.innerHTML = `
        <div class="modal__text">Se encontró un parche para tu sistema. ¿Deseas descargarlo?</div>
      `;
      modalActions.innerHTML = `
        <button class="btn" id="btnDescargar">✅ Descargar</button>
        <button class="btn btn-rojo" id="btnIgnorar">❌ Ignorar</button>
      `;
      document.getElementById("btnDescargar").onclick = iniciarDescargaParche;
      document.getElementById("btnIgnorar").onclick = cerrarModal;
      modalExtras.innerHTML = "";
      modalHint.textContent = "Podrás volver a buscarlo cuando quieras.";
    }

    function estadoNoDisponible() {
      modalTitle.textContent = "No hay parches disponibles";
      modalBody.innerHTML = `<div class="modal__text">Por ahora no hay parches para tu versión.</div>`;
      modalActions.innerHTML = `<button class="btn" id="btnOk">Entendido</button>`;
      document.getElementById("btnOk").onclick = cerrarModal;
      modalExtras.innerHTML = "";
      modalHint.textContent = "";
    }

    function estadoError() {
      modalTitle.textContent = "Error al comprobar";
      modalBody.innerHTML = `<div class="modal__text">No se pudo verificar el parche. Revisa tu conexión o intenta más tarde.</div>`;
      modalActions.innerHTML = `<button class="btn" id="btnCerrarErr">Cerrar</button>`;
      document.getElementById("btnCerrarErr").onclick = cerrarModal;
      modalExtras.innerHTML = "";
      modalHint.textContent = "";
    }

    function estadoDescargando() {
      modalTitle.textContent = "Descargando parche";
      modalBody.innerHTML = `<div class="modal__text">Iniciando descarga…</div>`;
      modalExtras.innerHTML = `
        <div class="progress" aria-hidden="true"><div id="barParche" class="progress__bar"></div></div>
        <div id="lblParche" class="modal__hint">0%</div>
      `;
      modalActions.innerHTML = `<button class="btn btn-rojo" id="btnCancelarDesc">Cancelar</button>`;
      document.getElementById("btnCancelarDesc").onclick = cerrarModal;
      modalHint.textContent = "";
    }

    function avanzarBarraParche(cbFin) {
      const bar = document.getElementById("barParche");
      const lbl = document.getElementById("lblParche");
      let pct = 0;
      const it = setInterval(() => {
        pct += Math.random() * 20 + 8;
        if (pct >= 100) pct = 100;
        bar.style.width = pct + "%";
        lbl.textContent = Math.round(pct) + "%";
        if (pct >= 100) {
          clearInterval(it);
          cbFin && cbFin();
        }
      }, 280);
      return it;
    }

    // ============ LÓGICA PARCHES ============
    document.getElementById("btnBuscarParche").addEventListener("click", () => {
      abrirModal();
      estadoBuscando();

      // Espera de 5s "buscando"
      setTimeout(() => {
        // HEAD al link del parche para verificar si existe
        const url = archivos.parche;
        if (!url || /xxxxx/.test(url)) {
          // Link no configurado
          estadoNoDisponible();
          return;
        }
        fetch(url, { method: "HEAD" })
          .then(resp => {
            if (resp.ok) {
              estadoDecision();
            } else {
              estadoNoDisponible();
            }
          })
          .catch(() => estadoError());
      }, 5000);
    });

    function iniciarDescargaParche() {
      estadoDescargando();
      // Simulación de progreso y luego dispara descarga real
      avanzarBarraParche(() => {
        // Disparar descarga real
        const a = document.createElement("a");
        a.href = archivos.parche;
        a.setAttribute("download", "ParcheDonVotex.exe");
        document.body.appendChild(a);
        a.click();
        a.remove();

        modalTitle.textContent = "Parche descargado";
        modalBody.innerHTML = `<div class="modal__text">Se inició la descarga del parche.</div>`;
        modalExtras.innerHTML = "";
        modalActions.innerHTML = `<button class="btn" id="btnCerrarFin">Cerrar</button>`;
        document.getElementById("btnCerrarFin").onclick = cerrarModal;
      });
    }

    // Cerrar modal con tecla ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("activo")) cerrarModal();
    });
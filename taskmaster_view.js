/**
 * TaskView.js
 * 
 * MVVM Pattern - View Layer
 * Verwaltet die gesamte Benutzeroberfläche und Interaktionen
 * 
 * Verantwortlichkeiten:
 * - DOM-Manipulation
 * - Event-Handling (Klicks, Touch-Events)
 * - UI-Updates (Rendering)
 * - Gestensteuerung (Swipe-to-Delete)
 * - Haptisches Feedback (Vibration)
 */

class TaskView {
    /**
     * Konstruktor initialisiert die View
     * Bindet alle DOM-Elemente und Event-Listener
     */
    constructor() {
        // ViewModel-Instanz erstellen
        this.viewModel = new TaskViewModel();
        
        // DOM-Elemente referenzieren
        this.taskInput = document.getElementById('taskInput');
        this.addBtn = document.getElementById('addBtn');
        this.tasksList = document.getElementById('tasksList');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.totalTasks = document.getElementById('totalTasks');
        this.completedTasks = document.getElementById('completedTasks');
        this.swipeIndicator = document.getElementById('swipeIndicator');

        // Touch-Event Variablen für Gestensteuerung
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.currentSwipeElement = null;

        // Event-Listener initialisieren
        this.initEventListeners();
        
        // Erste Darstellung rendern
        this.render();
    }

    /**
     * Registriert alle Event-Listener
     */
    initEventListeners() {
        // Aufgabe hinzufügen via Button
        this.addBtn.addEventListener('click', () => this.handleAddTask());
        
        // Aufgabe hinzufügen via Enter-Taste
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAddTask();
            }
        });

        // Filter-Buttons
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => this.handleFilterChange(btn));
        });

        // Touch-Events für Swipe-Gesten
        // passive: true für bessere Scroll-Performance
        this.tasksList.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        this.tasksList.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.tasksList.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }

    /**
     * Behandelt das Hinzufügen einer neuen Aufgabe
     */
    handleAddTask() {
        const text = this.taskInput.value;
        
        if (this.viewModel.addTask(text)) {
            // Erfolg: Eingabefeld leeren und UI aktualisieren
            this.taskInput.value = '';
            this.render();
            this.vibrate(50); // Kurzes haptisches Feedback
        } else {
            // Fehler: Shake-Animation zur Fehleranzeige
            this.taskInput.classList.add('shake');
            setTimeout(() => this.taskInput.classList.remove('shake'), 300);
        }
    }

    /**
     * Behandelt Filter-Button Klicks
     * 
     * @param {HTMLElement} btn - Geklickter Button
     */
    handleFilterChange(btn) {
        // Alle Buttons deaktivieren
        this.filterBtns.forEach(b => b.classList.remove('active'));
        
        // Geklickten Button aktivieren
        btn.classList.add('active');
        
        // Filter im ViewModel setzen
        this.viewModel.setFilter(btn.dataset.filter);
        
        // UI aktualisieren
        this.render();
    }

    /**
     * Touch-Start Event Handler
     * Speichert Start-Position für Swipe-Erkennung
     * 
     * @param {TouchEvent} e - Touch-Event
     */
    handleTouchStart(e) {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;

        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.currentSwipeElement = taskItem;
    }

    /**
     * Touch-Move Event Handler
     * Verfolgt Finger-Bewegung und verschiebt Element
     * 
     * @param {TouchEvent} e - Touch-Event
     */
    handleTouchMove(e) {
        if (!this.currentSwipeElement) return;

        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const deltaX = touchX - this.touchStartX;
        const deltaY = touchY - this.touchStartY;

        // Nur horizontale Swipes (verhindert Konflikt mit Scrollen)
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
            // Verhindere Standard-Scroll-Verhalten
            e.preventDefault();
            
            // Element mit Finger verschieben
            this.currentSwipeElement.style.transform = `translateX(${deltaX}px)`;
            
            // Opacity reduzieren je weiter verschoben
            this.currentSwipeElement.style.opacity = 1 - Math.abs(deltaX) / 300;
            
            // Swipe-Indicator anzeigen bei >100px
            if (Math.abs(deltaX) > 100) {
                this.showSwipeIndicator();
            }
        }
    }

    /**
     * Touch-End Event Handler
     * Entscheidet ob gelöscht oder zurückgesetzt wird
     * 
     * @param {TouchEvent} e - Touch-Event
     */
    handleTouchEnd(e) {
        if (!this.currentSwipeElement) return;

        // Berechne wie weit verschoben wurde
        const transform = this.currentSwipeElement.style.transform;
        const deltaX = transform ? parseInt(transform.match(/-?\d+/)?.[0] || 0) : 0;

        if (Math.abs(deltaX) > 150) {
            // Schwellwert überschritten → Löschen
            const taskId = parseInt(this.currentSwipeElement.dataset.id);
            this.viewModel.deleteTask(taskId);
            this.vibrate(100); // Starkes haptisches Feedback
            this.render();
        } else {
            // Zu wenig verschoben → Zurücksetzen
            this.currentSwipeElement.style.transform = '';
            this.currentSwipeElement.style.opacity = '';
        }

        this.currentSwipeElement = null;
        this.hideSwipeIndicator();
    }

    /**
     * Zeigt Swipe-Indicator an
     */
    showSwipeIndicator() {
        this.swipeIndicator.classList.add('show');
    }

    /**
     * Versteckt Swipe-Indicator
     */
    hideSwipeIndicator() {
        setTimeout(() => {
            this.swipeIndicator.classList.remove('show');
        }, 300);
    }

    /**
     * Schaltet Task-Status um (erledigt ↔ offen)
     * 
     * @param {number} id - Task-ID
     */
    toggleTask(id) {
        if (this.viewModel.toggleTask(id)) {
            this.vibrate(30); // Leichtes haptisches Feedback
            this.render();
        }
    }

    /**
     * Triggert Vibration (Haptisches Feedback)
     * 
     * @param {number} duration - Dauer in Millisekunden
     */
    vibrate(duration) {
        // Prüfe ob Vibration API verfügbar (nicht auf allen Geräten)
        if ('vibrate' in navigator) {
            navigator.vibrate(duration);
        }
    }

    /**
     * Formatiert Zeitstempel relativ (z.B. "vor 2h")
     * 
     * @param {Date} date - Zeitpunkt
     * @returns {string} Formatierter String
     */
    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Gerade eben';
        if (minutes < 60) return `vor ${minutes}min`;
        if (hours < 24) return `vor ${hours}h`;
        return `vor ${days}d`;
    }

    /**
     * Escaped HTML um XSS zu verhindern
     * 
     * @param {string} text - Zu escapender Text
     * @returns {string} Escaped HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Rendert die komplette UI neu
     * Wird nach jeder Datenänderung aufgerufen
     */
    render() {
        const tasks = this.viewModel.getFilteredTasks();
        const stats = this.viewModel.getStats();

        // Statistiken aktualisieren
        this.totalTasks.textContent = stats.total;
        this.completedTasks.textContent = stats.completed;

        // Tasks rendern oder Empty State anzeigen
        if (tasks.length === 0) {
            this.renderEmptyState();
        } else {
            this.renderTasks(tasks);
        }
    }

    /**
     * Rendert Empty State (keine Tasks vorhanden)
     */
    renderEmptyState() {
        this.tasksList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">✨</div>
                <p>Keine Aufgaben vorhanden</p>
                <p style="font-size: 14px; margin-top: 10px;">Füge deine erste Aufgabe hinzu!</p>
            </div>
        `;
    }

    /**
     * Rendert Liste von Tasks
     * 
     * @param {TaskModel[]} tasks - Array von Tasks
     */
    renderTasks(tasks) {
        this.tasksList.innerHTML = tasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}" 
                 data-id="${task.id}"
                 onclick="view.toggleTask(${task.id})">
                <div class="checkbox"></div>
                <div class="task-text">${this.escapeHtml(task.text)}</div>
                <div class="task-time">${this.formatTime(task.createdAt)}</div>
            </div>
        `).join('');
    }
}
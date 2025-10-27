/**
 * TaskViewModel.js
 * 
 * MVVM Pattern - ViewModel Layer
 * Enthält die gesamte Business Logic und verwaltet die Daten
 * 
 * Verantwortlichkeiten:
 * - Tasks verwalten (hinzufügen, löschen, bearbeiten)
 * - Daten in LocalStorage speichern/laden
 * - Filter-Logik
 * - Statistiken berechnen
 */

class TaskViewModel {
    /**
     * Konstruktor initialisiert das ViewModel
     * Lädt bestehende Tasks aus LocalStorage
     */
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.loadTasks();
    }

    /**
     * Lädt Tasks aus LocalStorage
     * Wird beim App-Start aufgerufen
     */
    loadTasks() {
        try {
            const stored = localStorage.getItem('tasks');
            if (stored) {
                const parsed = JSON.parse(stored);
                this.tasks = parsed.map(t => TaskModel.fromJSON(t));
                console.log(`${this.tasks.length} Tasks aus LocalStorage geladen`);
            }
        } catch (error) {
            console.error('Fehler beim Laden der Tasks:', error);
            this.tasks = [];
        }
    }

    /**
     * Speichert alle Tasks in LocalStorage
     * Wird nach jeder Änderung aufgerufen
     */
    saveTasks() {
        try {
            const json = this.tasks.map(t => t.toJSON());
            localStorage.setItem('tasks', JSON.stringify(json));
            console.log(`${this.tasks.length} Tasks in LocalStorage gespeichert`);
        } catch (error) {
            console.error('Fehler beim Speichern der Tasks:', error);
            // Bei Quota-exceeded Fehler könnte man hier alte Tasks löschen
        }
    }

    /**
     * Fügt eine neue Aufgabe hinzu
     * 
     * @param {string} text - Aufgabentext
     * @returns {boolean} true bei Erfolg, false bei ungültiger Eingabe
     */
    addTask(text) {
        // Validierung: Text darf nicht leer sein
        if (!text || !text.trim()) {
            console.warn('Leerer Task-Text wurde abgelehnt');
            return false;
        }

        // Neuen Task erstellen mit Timestamp als ID
        const task = new TaskModel(Date.now(), text.trim());
        
        // Am Anfang der Liste hinzufügen (neueste zuerst)
        this.tasks.unshift(task);
        
        // In LocalStorage speichern
        this.saveTasks();
        
        console.log(`Task hinzugefügt: "${text}"`);
        return true;
    }

    /**
     * Schaltet den Status einer Aufgabe um (erledigt ↔ offen)
     * 
     * @param {number} id - ID des Tasks
     * @returns {boolean} true bei Erfolg, false wenn Task nicht gefunden
     */
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            console.log(`Task ${id} Status geändert: ${task.completed}`);
            return true;
        }
        
        console.warn(`Task ${id} nicht gefunden`);
        return false;
    }

    /**
     * Löscht eine Aufgabe
     * 
     * @param {number} id - ID des zu löschenden Tasks
     */
    deleteTask(id) {
        const beforeLength = this.tasks.length;
        this.tasks = this.tasks.filter(t => t.id !== id);
        
        if (this.tasks.length < beforeLength) {
            this.saveTasks();
            console.log(`Task ${id} gelöscht`);
        } else {
            console.warn(`Task ${id} konnte nicht gelöscht werden (nicht gefunden)`);
        }
    }

    /**
     * Gibt gefilterte Tasks zurück basierend auf aktuellem Filter
     * 
     * @returns {TaskModel[]} Array von gefilterten Tasks
     */
    getFilteredTasks() {
        switch(this.currentFilter) {
            case 'active':
                // Nur offene (nicht erledigte) Tasks
                return this.tasks.filter(t => !t.completed);
            
            case 'completed':
                // Nur erledigte Tasks
                return this.tasks.filter(t => t.completed);
            
            default:
                // Alle Tasks
                return this.tasks;
        }
    }

    /**
     * Setzt den aktuellen Filter
     * 
     * @param {string} filter - 'all', 'active', oder 'completed'
     */
    setFilter(filter) {
        this.currentFilter = filter;
        console.log(`Filter geändert zu: ${filter}`);
    }

    /**
     * Berechnet Statistiken über alle Tasks
     * 
     * @returns {Object} Objekt mit total und completed Zählern
     */
    getStats() {
        return {
            total: this.tasks.length,
            completed: this.tasks.filter(t => t.completed).length,
            active: this.tasks.filter(t => !t.completed).length
        };
    }

    /**
     * Löscht ALLE Tasks (für Reset/Debug)
     * VORSICHT: Unumkehrbar!
     */
    clearAllTasks() {
        this.tasks = [];
        this.saveTasks();
        console.log('Alle Tasks gelöscht');
    }
}
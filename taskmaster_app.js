/**
 * app.js
 * 
 * Haupteinstiegspunkt der Applikation
 * Initialisiert die View und macht sie global verfügbar
 */

// Globale Variable für die View-Instanz
let view;

// Warte bis DOM vollständig geladen ist
document.addEventListener('DOMContentLoaded', () => {
    console.log('TaskMaster wird initialisiert...');
    
    // View-Instanz erstellen
    // Diese erstellt automatisch das ViewModel und lädt die Daten
    view = new TaskView();
    
    console.log('TaskMaster erfolgreich gestartet! ✅');
    
    // Optional: Service Worker registrieren (für PWA)
    if ('serviceWorker' in navigator) {
        // Auskommentiert, da kein Service Worker vorhanden
        // navigator.serviceWorker.register('/sw.js')
        //     .then(reg => console.log('Service Worker registriert'))
        //     .catch(err => console.log('Service Worker Fehler:', err));
    }
    
    // Debug-Funktionen für Konsole verfügbar machen
    window.debug = {
        getTasks: () => view.viewModel.tasks,
        getStats: () => view.viewModel.getStats(),
        clearAll: () => {
            if (confirm('Wirklich ALLE Tasks löschen?')) {
                view.viewModel.clearAllTasks();
                view.render();
            }
        },
        addDemoData: () => {
            view.viewModel.addTask('Einkaufen gehen');
            view.viewModel.addTask('Email an Chef senden');
            view.viewModel.addTask('Projekt-Präsentation vorbereiten');
            view.viewModel.addTask('Sport treiben');
            view.viewModel.toggleTask(view.viewModel.tasks[1].id);
            view.render();
            console.log('Demo-Daten hinzugefügt');
        }
    };
    
    console.log('Debug-Funktionen verfügbar: window.debug');
});
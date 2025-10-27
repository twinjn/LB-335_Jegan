/**
 * TaskModel.js
 * 
 * MVVM Pattern - Model Layer
 * Repräsentiert eine einzelne Aufgabe mit allen relevanten Daten
 * 
 * Das Model ist "dumm" - es enthält nur Daten, keine Logik
 */

class TaskModel {
    /**
     * Konstruktor für ein neues Task-Objekt
     * 
     * @param {number} id - Eindeutige ID (Timestamp)
     * @param {string} text - Aufgabentext
     * @param {boolean} completed - Status (erledigt oder nicht)
     * @param {Date} createdAt - Erstellungszeitpunkt
     */
    constructor(id, text, completed = false, createdAt = new Date()) {
        this.id = id;
        this.text = text;
        this.completed = completed;
        this.createdAt = createdAt;
    }

    /**
     * Konvertiert das Task-Objekt zu JSON-Format
     * Nützlich für LocalStorage-Speicherung
     * 
     * @returns {Object} JSON-Repräsentation des Tasks
     */
    toJSON() {
        return {
            id: this.id,
            text: this.text,
            completed: this.completed,
            createdAt: this.createdAt.toISOString()
        };
    }

    /**
     * Erstellt ein TaskModel-Objekt aus JSON-Daten
     * Nützlich beim Laden aus LocalStorage
     * 
     * @param {Object} json - JSON-Objekt mit Task-Daten
     * @returns {TaskModel} Neues TaskModel-Objekt
     */
    static fromJSON(json) {
        return new TaskModel(
            json.id,
            json.text,
            json.completed,
            new Date(json.createdAt)
        );
    }
}
class CommandQueue {

    constructor(...elements) {
        this.items = [];
        if (elements.length > 0) {
            this.enqueue(...elements); // Добавляем все переданные элементы
        }
    }

    /**
     * Добавляет элементы в начало очереди.
     * @param {...any} elements - Элементы для добавления.
     */
    enqueueFront(...elements) {
        if (elements.length > 0) {
            this.items.unshift(...elements);
        }
    }

    enqueue(...element) {
        if (element != null) {
            this.items.push(...element);
        }
    }

    dequeue() {
        if (this.isEmpty()) {
            return null;
        }
        return this.items.shift();
    }

    peek() {
        if (this.isEmpty()) {
            return null;
        }
        return this.items[0];
    }

    isEmpty() {
        return this.items.length === 0;
    }

    size() {
        return this.items.length;
    }

    clear() {
        this.items = [];
    }

    toString() {
        return this.items.toString();
    }
}

module.exports = CommandQueue
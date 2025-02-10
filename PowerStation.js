class PowerStation {
  constructor(batteryCapacity, maximumInput, maximumOutput) {
    this.batteryCapacity = batteryCapacity; // Ємність акумулятора
    this.maximumInput = maximumInput; // Максимальна вхідна потужність
    this.maximumOutput = maximumOutput; // Максимальна вихідна потужність
    this.currentBattery = batteryCapacity; // Поточний рівень заряду акумулятора
    this.inputPower = 0; // Поточна вхідна потужність
    this.outputs = new Map(); // Виходи електростанції
  }

  updateInput(voltage, current) {
    const inputPower = voltage * current; // Розрахунок вхідної потужності (V * I)
    this.inputPower = Math.min(inputPower, this.maximumInput); // Встановлення вхідної потужності до максимуму
  }

  connectOutput(outputId) {
    this.outputs.set(outputId, { voltage: 0, current: 0 }); // Підключення нового виходу
  }

  updateOutput(outputId, voltage, current) {
    if (this.outputs.has(outputId)) {
      this.outputs.set(outputId, { voltage, current }); // Оновлення параметрів підключеного виходу
    }
  }

  disconnectOutput(outputId) {
    this.outputs.delete(outputId); // Відключення виходу
  }

  updateBatteryLevel(capacityLeft) {
    this.currentBattery = Math.max(
      0,
      Math.min(capacityLeft, this.batteryCapacity)
    ); // Оновлення рівня заряду акумулятора, з урахуванням меж
  }

  get batteryPercentage() {
    return Number(
      ((this.currentBattery / this.batteryCapacity) * 100).toFixed(1)
    ); // Розрахунок процентного рівня заряду акумулятора
  }

  get totalOutputPower() {
    let totalPower = 0;
    for (let { voltage, current } of this.outputs.values()) {
      totalPower += voltage * current; // Розрахунок загальної вихідної потужності
    }
    return Math.min(Math.round(totalPower), this.maximumOutput); // Обмеження загальної вихідної потужності до максимуму
  }

  get timeRemaining() {
    const netPower = this.inputPower - this.totalOutputPower; // Обчислення чистої потужності (вхід - вихід)

    if (netPower === 0) return "99:59"; // Якщо чиста потужність = 0, повертає час, який означає "невизначено довго"

    let timeHours;
    if (netPower > 0) {
      timeHours = (this.batteryCapacity - this.currentBattery) / netPower; // Розрахунок часу для повного заряду
    } else {
      timeHours = this.currentBattery / -netPower; // Розрахунок часу для повної розрядки
    }

    if (timeHours < 0 || !isFinite(timeHours)) {
      return "99:59"; // Якщо результат не коректний, повертає час "невизначено довго"
    }

    const totalMinutes = Math.round(timeHours * 60); // Перетворення часу в хвилини
    const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0"); // Форматування годин
    const minutes = String(totalMinutes % 60).padStart(2, "0"); // Форматування хвилин

    return `${hours}:${minutes}`; // Повернення часу у форматі "ГГ:ХХ"
  }

  get status() {
    if (
      this.inputPower > this.maximumInput ||
      this.totalOutputPower > this.maximumOutput
    ) {
      return "overload"; // Стан "перевантаження" при перевищенні вхідної або вихідної потужності
    }

    if (this.inputPower > this.totalOutputPower && this.inputPower > 0) {
      return "charging"; // Стан "зарядки" при вхідній потужності більше вихідної
    }

    if (this.totalOutputPower > this.inputPower && this.totalOutputPower > 0) {
      return "discharging"; // Стан "розрядки" при вихідній потужності більше вхідної
    }

    return "idle"; // Стан "бездіяльність", якщо немає зарядки або розрядки
  }
}

var TohaCalulator = function (elementId, enableChart) {
    // Potential TVA for a given date
    var PotentialTVA = function (forDateTime) {
        var obj = {
            name: '',
            target: null,
            targetlocal: null,
            anniversary: Date.UTC(2024,6,1,0,0,0), // NZT 2024-07-01T12:00:00
            mahi: 26,
            ratio: ((1 + Math.sqrt(5)) / 2),
            inflation: 0.033,
            baseRate: 0.5,
            discount: 0,
            multiplier: 0,
            tohaRate: function(amount) {
                return amount * this.mahi * this.multiplier;
            },
            hoursBetween: (rangeEnd, rangeStart) => {
                var hourFromMilli = 60 * 60 * 1000;
                return Math.floor(Math.abs(rangeEnd - rangeStart) / hourFromMilli);
            },
            format: {
                ref: null,
                discount: function() {
                    return (this.ref.discount * 100).toFixed(3) + '%'; 
                },
                multiplier: function() {
                    return this.ref.multiplier.toFixed(4);     
                },
                target: function() {
                    var d = new Date(this.ref.target);
                    var dayVal = d.getDate().toString(), day = '';
                    var dayParts = Array.from(dayVal);
                    switch (dayParts[dayParts.length - 1]) {
                        case '3': {
                            if (dayVal == "13") {
                                day = dayVal + 'th';
                                break;
                            }
                            day = dayVal + 'rd';
                            break;
                        }
                        case '2': {
                            if (dayVal == "12") {
                                day = dayVal + 'th';
                                break;
                            }
                            day = dayVal + 'nd';
                            break;
                        }
                        case '1': {
                            if (dayVal == "11") {
                                day = dayVal + 'th';
                                break;
                            }
                            day = dayVal + 'st';
                            break;
                        }
                        default: {
                            day = dayVal + 'th';
                        }
                    }
                    
                    return day + ' ' + d.toLocaleString('en-NZ', { month: 'short' }) + ' ' + d.getFullYear();
                }
            },
            init: function () {
                this.target = new Date(forDateTime.toUTC());
                this.format.ref = this;
    
                var totalHours = 0,
                    rangeTarget = null,
                    adjustment = 0,
                    hoursSince = null,
                    hoursUntil = null;
    
                if (new Date(this.target).getTime() < new Date(this.anniversary).getTime()) {
                    // Pre-Anniversary Formula
                    rangeTarget = Date.UTC(2015, 11, 31, 23, 0, 0); // NZST 2016-01-01T12:00:00
                    totalHours = this.hoursBetween(this.anniversary, rangeTarget);
                    adjustment = (totalHours / (24 * 365)) * (Math.log(1 + this.inflation) / Math.log(this.ratio));
                    hoursUntil = this.hoursBetween(this.anniversary, this.target);
    
                    this.name = 'PRE';
                    this.discount = (this.baseRate * Math.pow(this.ratio, ((adjustment * hoursUntil) / totalHours)));
                } else {
                    // Post-Anniversary Formula
                    rangeTarget = Date.UTC(2030, 11, 30, 23, 0, 0); // NZST 2030-11-31T12:00:00
                    totalHours = this.hoursBetween(rangeTarget, this.anniversary);
                    adjustment = 12;
                    hoursSince = this.hoursBetween(this.target, this.anniversary);
    
                    this.name = 'POST';
                    this.discount = (this.baseRate * Math.pow(this.ratio, ((-1 * adjustment * hoursSince) / totalHours)));
                }
    
                this.multiplier = ((this.mahi / (1 - this.discount)) / this.mahi);
    
                delete this.init;
                return this;
            }
        }.init();
        return obj;
    };

    // Toha Calculator
    var obj = {
        currentTVA: {},
        chart: {},
        mahiResult: 0,
        multiplierResult: 0,
        tohaRestul: 0,
        dateInput: '',
        amountInput: 0,
        displayInput: 0,
        initialDate: new Date(2024, 0, 1),
        initialDateObj: function()  { return new Date(this.initialDate.toUTCString()); },
        element: null,
        mahiMode: true,
        showRoundedTVA: true,
        localeOptions: {
            style: 'decimal',  // Other options: 'currency', 'percent', etc.
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        },
        localeOptionsNoDecimal: {
            style: 'decimal',  // Other options: 'currency', 'percent', etc.
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        },
        today: () => new Date().toISOString().split('T')[0],
        daysBetween: (startDate, endDate) => {
            let timeDifference = endDate.getTime() - startDate.getTime();
            let daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));   
            return daysDifference;
        },
        today: () => new Date().toISOString().split('T')[0],
        updateCalulation: function () {
            let creditDifferenceElement = document.querySelector('.tc__result-tag');

            // Calculate tomorrow's date/tva
            let today = new Date();
            today.setHours(12);
            today.setMinutes(0);
            today.setMilliseconds(0);
            let todaysTVA = new PotentialTVA(today);
            this.currentTVA = new PotentialTVA(new Date(Date.parse(this.dateInput.value)));

            // Calclulate in MAHI
            if (this.mahiMode) {
                document.querySelector('.tc__line.mahi').style.display = 'none';
                document.querySelector('.tc__amount-label').textContent = "Amount of MAHI";
                document.querySelector('.tc__mode-button').textContent = "Calculate in NZD";
                document.querySelector('.tc__mode-button').textContent = "Calculate in NZD";
                document.querySelector('.tc__pay-rate').style.display = 'block';

                let  ammountYouPay = (this.currentTVA.mahi * this.amountInput.value);
                this.mahiResult.textContent = `${(Math.floor(this.amountInput.value / this.currentTVA.mahi))}`;
                this.tohaResult.textContent = `$${this.currentTVA.tohaRate(this.amountInput.value).toLocaleString('en-NZ', this.localeOptions)}`;
                this.payResult.textContent = `$${(ammountYouPay).toLocaleString('en-NZ', this.localeOptions)}`;

                // If the user sets tomorrows date, show the difference for today
                if (this.currentTVA.target > today) {
                    let todaysSwapValue = todaysTVA.tohaRate(this.amountInput.value).toFixed(2);
                    let todayDifference = todaysSwapValue - (this.currentTVA.tohaRate(this.amountInput.value).toFixed(2));
                    creditDifferenceElement.textContent = `If you invested today +$${todayDifference.toLocaleString('en-NZ', this.localeOptions)}`;
                    creditDifferenceElement.style.display = 'none'; // Hidden for V1
                }
                else {
                    creditDifferenceElement.style.display = 'none';
                }
            }
            // Calclulate in NZD
            else {
                document.querySelector('.tc__line.mahi').style.display = 'grid';
                document.querySelector('.tc__amount-label').textContent = "Amount to invest";
                document.querySelector('.tc__mode-button').textContent = "Calculate in MAHI";
                document.querySelector('.tc__pay-rate').style.display = 'none';

                let ammountYouPay = ((Math.floor(this.amountInput.value / this.currentTVA.mahi)) * this.currentTVA.mahi);

                this.mahiResult.textContent = `${(Math.floor(this.amountInput.value / this.currentTVA.mahi))}`;
                this.tohaResult.textContent = `$${(ammountYouPay * this.currentTVA.multiplier).toLocaleString('en-NZ', this.localeOptions)}`;
                this.payResult.textContent = `$${(ammountYouPay).toLocaleString('en-NZ', this.localeOptionsNoDecimal)}`;

                // If the user sets tomorrows date, show the difference for today
                if (this.currentTVA.target > today) {
                    let todaysSwapValue = ammountYouPay * todaysTVA.multiplier;
                    let todayDifference = todaysSwapValue - (ammountYouPay * this.currentTVA.multiplier);
                    creditDifferenceElement.textContent = `If you invested today +$${todayDifference.toLocaleString('en-NZ', this.localeOptions)}`;
                    creditDifferenceElement.style.display = 'none'; // Hidden for V1
                }
                else {
                    creditDifferenceElement.style.display = 'none';
                }
            }
            document.querySelector('.tc__mahi-rate').textContent = `1 MAHI = $${this.currentTVA.mahi} each`;
            document.querySelector('.tc__pay-rate').textContent = `1 MAHI = $${this.currentTVA.mahi} each`;

            if (this.showRoundedTVA) {
                this.multiplierResult.classList.remove('small');
                this.multiplierResult.textContent = `x ${this.currentTVA.format.multiplier()}`;
                document.querySelector('.tc__multiplier-toggle').textContent = 'Show exact TVA';
            }
            else {
                this.multiplierResult.classList.add('small');
                document.querySelector('.tc__multiplier-toggle').textContent = 'Show rounded TVA';
                this.multiplierResult.textContent = `x ${this.currentTVA.multiplier.toFixed(16)}`;
            }

            if (enableChart) {
                // Update chart TVA multipler annotation
                const box1 = this.chart.options.plugins.annotation.annotations.box1;
                const line1 = this.chart.options.plugins.annotation.annotations.line1;

                if (this.currentTVA.format.multiplier() == 'NaN') { return; }

                box1.content = `TVA multiplier: x ${this.currentTVA.format.multiplier()}`;

                // Get the start date from the x axis and difference between selected date
                let startDate = this.initialDateObj();
                let selectedDate = new Date(Date.parse(this.dateInput.value));
                let dateDifDays = this.daysBetween(startDate, selectedDate);

                // Convert to the same scale as x axis (1 year = 2 on x)
                let xPos = dateDifDays / 182.5;
                line1.xMin = xPos;
                line1.xMax = xPos;
                box1.xValue = xPos;

                // Flip label side on other half of chart so it doesn't go off canvas
                box1.xAdjust = (xPos > 6) ? -150 : 20;

                this.chart.update();
            }
        },
        elementFromHtml: function(html) {
            const template = document.createElement('template');
            template.innerHTML = html.trim();
            return template.content.firstElementChild;
        },
        template: `
        <div class="tc__calc-container">
            <div class="tc__row">
                <div class="tc__card">
                    <div class="tc__inputs">
                        <label class="tc__amount-label" for="tc__amount">Amount of MAHI</label>
                        <label for="tc__date">Date of investment</label>
                        <input type="hidden" class="tc__amount-input" min="1" value="10" />
                        <input type="text" class="tc__amount-input-display" min="1" value="10" />

                        <input type="date" class="tc__date-input" />
                        <div class="tc__mode">
                        <a href="#" class="tc__mode-button">Calculate in NZD</a><i class="fa-solid fa-arrow-right-arrow-left"></i>
                       </div>
                    </div>
                
                    <label class="tc__chart-title">Time Value of Action (TVA)</label>
                    <div class="tc__chart-container">
                        <canvas class="tc__chart" id="toha-invest-chart"></canvas>
                    </div>
                </div>
                <div class="tc__card tc__no-pad">
                    <div class="tc__line mahi">
                        <p>No. of MAHI you can buy</p>
                        <h1 class="tc__mahi-result">$260.00</h1>
                        <div class="tc__mahi-rate"></div>
                    </div>
                    <div class="tc__line  pay">
                    <p>Amount you'll pay</p>
                    <h1 class="tc__pay-result">$260.00</h1>
                    <div class="tc__pay-rate"></div>
                </div>
                    <div class="tc__line tva ">
                        <p>TVA multiplier</p>
                        <h1 class="tc__multiplier-result">x 2.015</h1>
                        <div class="tc__multiplier-toggle">Show exact TVA</div>

                    </div>
                    <div class="tc__line  no-border">
                        <p>Future TOHA network tokens you could swap it for</p>
                        <h1 class="tc__toha-result">$523.90</h1>
                        <div class="tc__result-tag">If you invest today +$9,234</div>
                    </div>
                    <div class="tc__disclaimer tc__md">
                    Note the TVA has been rounded for presentation purposes and is indicative only. Official calculation to be published in the upcoming TOHA white paper.
                    </div>
                    <a href="https://mahi.toha.network/#presale" class="tc__btn tc__md">Join the presale list </a>
                </div>

                <div class="tc__disclaimer tc__sm">
                Note the TVA has been rounded for presentation purposes and is indicative only. Official calculation to be published in the upcoming TOHA white paper.
                </div>
                <a href="https://mahi.toha.network/#presale" target="_blank" class="tc__btn tc__sm">Join the presale list</a>

            </div>
            <img src="logo_toha_powered_long.png" class="tc__logo" />
        </div>
        `,
        init: function () {
            this.element = document.getElementById(elementId);
            if (!this.element) {
                throw (`Unable to attach calculator to DOM element with id ${elementId}`);
            }

            // Attach template to DOM
            const htmlTemplateElement = this.elementFromHtml(this.template);
            this.element.append(htmlTemplateElement);

            this.displayInput = document.querySelector('.tc__amount-input-display');
            this.amountInput = document.querySelector('.tc__amount-input');
            this.dateInput = document.querySelector('.tc__date-input');
            this.mahiResult = document.querySelector('.tc__mahi-result');
            this.tohaResult = document.querySelector('.tc__toha-result');
            this.multiplierResult = document.querySelector('.tc__multiplier-result');
            this.modeButton = document.querySelector('.tc__mode');
            this.tvaModeButton = document.querySelector('.tc__multiplier-toggle');
            this.payResult = document.querySelector('.tc__pay-result');

            this.dateInput.value = this.today();
            this.dateInput.setAttribute('min', this.today());

            // TVA Graph
            // Fixed window from 2024 - 2030
            const labels = [], data = [];
            for (let d = 0; d < 7; d++) {
                let nextYear = this.initialDateObj().getFullYear() + d;
                labels.push('',nextYear);
                data.push(new PotentialTVA(new Date(nextYear, 0, 1)).multiplier,
                          new PotentialTVA(new Date(nextYear, 6, 1)).multiplier);
            }

            let dragging = false;

            // Init ChartJS
            if (enableChart) {
                let ctx = document.getElementById('toha-invest-chart');

                this.chart = new Chart(ctx, {
                    type: 'line',
                    options: {
                        events: ['mousedown', 'mouseup', 'mousemove', 'mouseout', 'touchstart', 'touchmove', 'touchend', 'click'],
                        responsive: true,
                        maintainAspectRatio: false,
                        onResize: function (x, y) {
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                min: 1,
                                max: 2.4,
                                ticks: {
                                    stepSize: 0.5,
                                    suggestedMin: 1,
                                    suggestedMax: 2
                                },
                                border: {
                                    display: false
                                },
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Rate'
                                },
                                grid: {
                                    display: false
                                }
                            },
                            x: {
                                grid: {
                                    display: false
                                }
                            }
                        },

                        onHover: (e) => {
                            switch (e.type) {
                                case 'mousedown':
                                case 'touchstart':
                                    dragging = true;
                                    break;
                                case 'mousemove':
                                case 'touchmove':
                                    break;
                                case 'touchend':
                                default:
                                    dragging = false;
                                    break;

                            }
                            if (dragging && e.type == 'mousemove' || e.type == 'touchmove') {
                                let canvasPosition = Chart.helpers.getRelativePosition(e, this.chart);

                                // Substitute the appropriate scale IDs
                                let dataX = this.chart.scales.x.getValueForPixel(canvasPosition.x);
                                let startDate = this.initialDateObj(), newDate = this.initialDateObj();
                                let months = dataX * 6;
                                newDate.setMonth(startDate.getMonth() + months);
                                this.dateInput.value = newDate.toNZTISO();

                                debounce(this.updateCalulation(), 300);
                            }
                        }
                        ,
                        onClick: (e) => {
                            // Handle click selection of annotiations 
                            const canvasPosition = Chart.helpers.getRelativePosition(e, this.chart);

                            // Substitute the appropriate scale IDs
                            const dataX = this.chart.scales.x.getValueForPixel(canvasPosition.x);
                            const startDate = this.initialDateObj(), newDate = this.initialDateObj();
                            const months = dataX * 6;
                            newDate.setMonth(startDate.getMonth() + months);
                            this.dateInput.value = newDate.toNZTISO();

                            this.updateCalulation();
                        },
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                enabled: false
                            },
                            annotation: {
                                annotations: {
                                    line1: {
                                        type: 'line',
                                        xMin: 2,
                                        xMax: 2,
                                        yMin: 0,
                                        yMax: 2.4,
                                        borderWidth: 1,
                                        borderDash: [10],
                                        padding: 5,
                                        borderColor: '#11869E'
                                    },
                                    box1: {
                                        // Indicates the type of annotation
                                        type: 'label',
                                        xValue: 2,
                                        yValue: 2.2,
                                        xAdjust: 20,
                                        yAdjust: -13,
                                        padding: 4,
                                        color: '#11869E',
                                        borderColor: '#dbeff1',
                                        backgroundColor: '#dbeff1',
                                        borderRadius: 4,
                                        borderWidth: 3,
                                        content: '',
                                        position: {
                                            x: 'start',
                                            y: 'start'
                                        },
                                        font: {
                                            family: 'Hanken Grotesk, Arial, sans-serif',
                                            size: 14,
                                            weight: 'medium'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    data: {
                        labels: labels,
                        datasets: [{
                            data: data,
                            borderWidth: 2,
                            borderColor: '#11869E',
                            tension: 0.3,
                            pointRadius: 0,
                            cubicInterpolationMode: 'default'
                        }]
                    }
                });
            }

            this.tvaModeButton.addEventListener("click", (e) => {
                this.showRoundedTVA = !this.showRoundedTVA;
                this.updateCalulation();
            });

            this.amountInput.addEventListener("keyup", () => this.updateCalulation());
            this.amountInput.addEventListener("change", () => this.updateCalulation());
            this.dateInput.addEventListener("change", () => this.updateCalulation());
            this.modeButton.addEventListener("click", (e) => {
                e.preventDefault();
                this.mahiMode = !this.mahiMode;
                if (!this.mahiMode && this.amountInput.value < 26) {
                    this.amountInput.value = 26;
                    this.displayInput.value = 26;
                } else {
                    this.amountInput.value = 10;
                    this.displayInput.value = 10;
                }

                updateTextInput();
                this.updateCalulation();
            });

            // Format the input with commas
            this.displayInput.addEventListener("keyup", () => {
                updateTextInput();
            });

            function debounce(func, timeout = 300) {
                let timer;
                return (...args) => {
                    clearTimeout(timer);
                    timer = setTimeout(() => { func.apply(this, args); }, timeout);
                };
            }

            const updateTextInput = () => {
                var num = getNumber(this.displayInput.value);
                if (isNaN(num)) { num = 0 }

                if (this.mahiMode) {
                    this.displayInput.value = `${num.toLocaleString()}`;
                }
                else {
                    this.displayInput.value = `$${num.toLocaleString()}`;
                }

                this.amountInput.value = num;
                this.amountInput.dispatchEvent(new Event('change'));
            }

            function getNumber(_str) {
                var cleanStr = _str.replaceAll(',', '').replaceAll('$', '');
                return Number.parseInt(cleanStr);
            }

            // Prevent entering decimals, exponents, and letters
            this.displayInput.addEventListener('keydown', function (event) {
                // Allow only numeric keys, Backspace, and Arrow keys
                if (!((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105) || event.keyCode === 8 || event.keyCode === 37 || event.keyCode === 39)) {
                    event.preventDefault();
                }

                // Allow Backspace and Arrow keys
                if (event.keyCode === 8 || event.keyCode === 37 || event.keyCode === 39) {
                    return;
                }

                // Prevent decimal point (.)
                if (event.key === '.') {
                    event.preventDefault();
                }

                // Prevent exponents and letters
                const value = this.value + event.key;
                if (/[^0-9,$]/.test(value)) {
                    event.preventDefault();
                }
            });

            // Prevent pasting invalid characters
            this.amountInput.addEventListener('paste', function (event) {
                const pastedText = (event.clipboardData || window.clipboardData).getData('text');
                if (!/^\d+$/.test(pastedText)) {
                    event.preventDefault();
                }
            });

            this.updateCalulation();
            return this;
        }
    }.init();

    return obj;
}

// Helper extensions
// -----------------------------------------------
Date.prototype.toUTC = function () {
    var d = this;
    return Date.UTC(
        d.getUTCFullYear(),
        d.getUTCMonth(),
        d.getUTCDate(),
        d.getUTCHours(),
        d.getUTCMinutes(),
        0
    );
};

Date.prototype.toNZTISO = function() {
    let d = this;
    const intlFormat = new Intl.DateTimeFormat('en-NZ', {
        timeZone: 'Pacific/Auckland',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    let dString = intlFormat.format(d).split('/');
    return dString[2] + '-' + dString[1] + '-' + dString[0];
};
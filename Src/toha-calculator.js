var TohaCalulator = function (elementId, enableChart) {
    var obj = {
        currentTva: {},
        chart: {},
        mahiResult: 0,
        multiplierResult: 0,
        tohaRestul: 0,
        dateInput: '',
        amountInput: 0,
        displayInput: 0,
        dates: [],
        element: null,
        mahiMode: true,
        showRoundedTva: true,
        localeOptions: {
            style: 'decimal',  // Other options: 'currency', 'percent', etc.
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        },
        today: () => new Date().toISOString().split('T')[0],
        updateCalulation: function () {

            // Calculate tomorrow's date/tva
            let today = new Date();
            today.setHours(13);
            today.setMinutes(0);
            today.setMilliseconds(0);
            let creditDifferenceElement = document.querySelector('.tc__result-tag');
            let todaysTva = new potentialTVA(today)
            this.currentTva = new potentialTVA(new Date(Date.parse(this.dateInput.value)))

            // Calclulate in MAHI
            if (this.mahiMode) {
                document.querySelector('.tc__line.mahi').style.display = 'none';
                document.querySelector('.tc__amount-label').textContent = "Amount of MAHI";
                document.querySelector('.tc__mode-button').textContent = "Calculate in NZD";
                document.querySelector('.tc__mode-button').textContent = "Calculate in NZD";
                document.querySelector('.tc__pay-rate').style.display = 'block';

                var ammountYouPay = (this.currentTva.mahi * this.amountInput.value);
                this.mahiResult.textContent = `${(Math.floor(this.amountInput.value / this.currentTva.mahi))}`;
                this.tohaResult.textContent = `$${this.currentTva.tohaRate(this.amountInput.value).toLocaleString('en-NZ', this.localeOptions)}`;
                this.payResult.textContent = `$${(ammountYouPay).toLocaleString('en-NZ', this.localeOptions)}`;

                // If the user sets tomorrows date, show the difference for today
                if (this.currentTva.target > today) {
                    let todaysSwapValue = todaysTva.tohaRate(this.amountInput.value).toFixed(2);
                    let todayDifference = todaysSwapValue - (this.currentTva.tohaRate(this.amountInput.value).toFixed(2));
                    creditDifferenceElement.textContent = `If you invested today +$${todayDifference.toLocaleString('en-NZ', this.localeOptions)}`
                    creditDifferenceElement.style.display = 'flex'
                }
                else {
                    creditDifferenceElement.style.display = 'none'
                }
            }
            // Calclulate in NZD
            else {
                document.querySelector('.tc__line.mahi').style.display = 'grid';
                document.querySelector('.tc__amount-label').textContent = "Amount to invest";
                document.querySelector('.tc__mode-button').textContent = "Calculate in MAHI";
                document.querySelector('.tc__pay-rate').style.display = 'none';

                var ammountYouPay = ((Math.floor(this.amountInput.value / this.currentTva.mahi)) * this.currentTva.mahi);

                this.mahiResult.textContent = `${(Math.floor(this.amountInput.value / this.currentTva.mahi))}`;
                this.tohaResult.textContent = `$${(ammountYouPay * this.currentTva.multiplier).toLocaleString('en-NZ', this.localeOptions)}`;
                this.payResult.textContent = `$${(ammountYouPay).toLocaleString('en-NZ', this.localeOptionsNoDecimal)}`;

                // If the user sets tomorrows date, show the difference for today
                if (this.currentTva.target > today) {
                    let todaysSwapValue = ammountYouPay * todaysTva.multiplier;
                    let todayDifference = todaysSwapValue - (ammountYouPay * this.currentTva.multiplier);
                    creditDifferenceElement.textContent = `If you invested today +$${todayDifference.toLocaleString('en-NZ', this.localeOptions)}`
                    creditDifferenceElement.style.display = 'flex'
                }
                else {
                    creditDifferenceElement.style.display = 'none'
                }
            }
            document.querySelector('.tc__mahi-rate').textContent = `1 MAHI = $${this.currentTva.mahi} each`;
            document.querySelector('.tc__pay-rate').textContent = `1 MAHI = $${this.currentTva.mahi} each`;

            if (this.showRoundedTva) {
                this.multiplierResult.classList.remove('small')
                this.multiplierResult.textContent = `x ${this.currentTva.multiplierDisplay()}`;
                document.querySelector('.tc__multiplier-toggle').textContent = 'Show exact TVA';
            }
            else {
                this.multiplierResult.classList.add('small')
                document.querySelector('.tc__multiplier-toggle').textContent = 'Show rounded TVA';
                this.multiplierResult.textContent = `x ${this.currentTva.multiplier}`;
            }

            if (enableChart) {
                // Update chart TVA multipler annotation
                const box1 = this.chart.options.plugins.annotation.annotations.box1;
                const line1 = this.chart.options.plugins.annotation.annotations.line1;

                if (this.currentTva.multiplierDisplay() == 'NaN') {
                    return;
                }

                box1.content = `TVA Multiplier: x ${this.currentTva.multiplierDisplay()}`

                // Get the start date from the x axis and difference between selected date
                var startDate = this.dates[0].tva.dateObj();
                var selectedDate = new Date(Date.parse(this.dateInput.value));
                var dateDifDays = getDayDifference(startDate, selectedDate);

                // Convert to the same scale as x axis (1 year = 2 on x)
                var xPos = dateDifDays / 365;
                line1.xMin = xPos;
                line1.xMax = xPos;
                box1.xValue = xPos;

                // Flip label side on other half of chart so it doesn't go off canvas
                if (xPos > 4) {
                    box1.xAdjust = -150;
                }
                else {
                    box1.xAdjust = 20;
                }

                this.chart.update();
            }
        },
        init: function () {
            this.element = document.getElementById(elementId);
            if (!this.element) {
                throw (`Unable to attach calculator to DOM element with id ${elementId}`)
            }

            // Attach template to DOM
            const htmlTemplateElement = elementFromHtml(this.template);
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
            var labels = [];
            var data = [];
            const currentDate = new Date();
            const datesArray = [];

            for (let i = 0; i < 8; i++) {
                const nextYear = currentDate.getFullYear() + i;
                const nextDate = new Date(nextYear, 0, currentDate.getDate());

                datesArray.push({
                    label: nextDate.getFullYear(),
                    tva: new potentialTVA(nextDate)
                });
            }

            this.dates = datesArray;

            for (var ix in this.dates) {
                labels.push(this.dates[ix].label);
                data.push(this.dates[ix].tva.multiplier);
            }

            var dragging = false;

            // Init ChartJS
            if (enableChart) {
                var ctx = document.getElementById('toha-invest-chart');

                this.chart = new Chart(ctx, {
                    type: 'line',
                    options: {
                        events: ['mousedown', 'mouseup', 'mousemove', 'mouseout', 'touchstart', 'touchmove'],
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
                                    suggestedMax: 2,
                                },
                                border: {
                                    display: false,
                                },
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Rate',
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
                                case 'mouseup':
                                    dragging = false;
                                    break;
                                case 'mousemove':
                                    break;
                            }

                            if (dragging && e.type == 'mousemove' || e.type == 'touchmove') {
                                const canvasPosition = Chart.helpers.getRelativePosition(e, this.chart);

                                // Substitute the appropriate scale IDs
                                const dataX = this.chart.scales.x.getValueForPixel(canvasPosition.x);
                                const startDate = this.dates[0].tva.dateObj();
                                const months = dataX * 12;
                                var newDate = startDate;
                                newDate.setMonth(startDate.getMonth() + months);
                                this.dateInput.value = newDate.toISOString().split('T')[0]
                                this.updateCalulation();
                            }
                        }
                        ,
                        onClick: (e) => {
                            // Handle click selection of annotiations 
                            const canvasPosition = Chart.helpers.getRelativePosition(e, this.chart);

                            // Substitute the appropriate scale IDs
                            const dataX = this.chart.scales.x.getValueForPixel(canvasPosition.x);
                            const startDate = this.dates[0].tva.dateObj();
                            const months = dataX * 12;
                            var newDate = startDate;
                            newDate.setMonth(startDate.getMonth() + months);
                            this.dateInput.value = newDate.toISOString().split('T')[0]

                            this.updateCalulation();
                        },
                        plugins: {
                            legend: {
                                display: false,
                            },
                            tooltip: {
                                enabled: false
                            },
                            // zoom: {
                            //     zoom: {
                            //         wheel: {
                            //             enabled: true,
                            //         },
                            //         pinch: {
                            //             enabled: true
                            //         },
                            //         mode: 'x',
                            //     }
                            // },
                            annotation: {
                                enter(ctx) {
                                    element = ctx.element;
                                },
                                leave(ctx, e) {

                                    element = undefined;
                                    lastEvent = undefined;
                                },
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
                                        borderColor: '#11869E',
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
                                        },
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
                            pointRadius: 0
                        }]
                    }
                });
            }

            this.tvaModeButton.addEventListener("click", (e) => {
                this.showRoundedTva = !this.showRoundedTva;
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
                }
                updateTextInput();
                this.updateCalulation()
            });

            // Format the input with commas
            this.displayInput.addEventListener("keyup", () => {
                updateTextInput();
            });

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
                        <p>TVA Multiplier</p>
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
                    <a href="#" class="tc__btn tc__md">Join the presale list </a>
                </div>

                <div class="tc__disclaimer tc__sm">
                    Note the TVA has been rounded for presentation purposes and is indicative only. Official calculation to be published in the upcoming TOHA white paper.
                </div>
                <a href="#" target="_blank" class="tc__btn tc__sm">Join the presale list</a>

            </div>
            <img src="../assets/941c27b6e3e54058a3f8eff53f32b52e/img/logo_toha_powered_long.png" class="tc__logo" />
        </div>
        `
    }.init();
    return obj;
}

// Helper methods
// -----------------------------------------------
var potentialTVA = function (forDateTime) {
    var obj = {
        name: '',
        target: null,
        targetlocal: null,
        anniversary: Date.UTC(2024, 1, 13, 23, 0, 0), // NZST 2024-02-14T12:00:00
        mahi: 26,
        ratio: ((1 + Math.sqrt(5)) / 2),
        inflation: 0.033,
        baseRate: 0.5,
        discount: 0,
        multiplier: 0,
        tohaRate: function (amount) {
            return amount * this.mahi * this.multiplier;
        },
        discountDisplay: function () { return (this.discount * 100).toFixed(3) + '%'; },
        // Round display TVA down to four decimal places
        multiplierDisplay: function () { return (Math.floor(this.multiplier * 10000) / 10000).toFixed(4); },
        date: function () {
            return DateCalcs.formatDate(this.target);
        },
        dateObj: function () {
            return new Date(this.target)
        },
        init: function () {
            this.target = new Date(forDateTime.toUTC());

            var totalHours = 0,
                rangeTarget = null,
                adjustment = 0;

            if (new Date(this.target).getTime() < new Date(this.anniversary).getTime()) {
                // Pre-Anniversary Formula
                rangeTarget = Date.UTC(2015, 11, 31, 23, 0, 0); // NZST 2016-01-01T12:00:00
                totalHours = DateCalcs.hoursBetween(this.anniversary, rangeTarget);
                adjustment = (totalHours / (24 * 365)) * (Math.log(1 + this.inflation) / Math.log(this.ratio));
                hoursUntil = DateCalcs.hoursBetween(this.anniversary, this.target);

                this.name = 'PRE';
                this.discount = (this.baseRate * Math.pow(this.ratio, ((adjustment * hoursUntil) / totalHours)));
            } else {
                // Post-Anniversary Formula
                rangeTarget = Date.UTC(2030, 11, 30, 23, 0, 0); // NZST 2030-11-31T12:00:00
                totalHours = DateCalcs.hoursBetween(rangeTarget, this.anniversary);
                adjustment = 12;
                hoursSince = DateCalcs.hoursBetween(this.target, this.anniversary);

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

function elementFromHtml(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
}

function getDayDifference(startDate, endDate) {
    var timeDifference = endDate.getTime() - startDate.getTime();
    var daysDifference = timeDifference / (1000 * 60 * 60 * 24);
    daysDifference = Math.floor(daysDifference);

    return daysDifference;
}

var DateCalcs = {
    hoursBetween: function (rangeEnd, rangeStart) {
        var hourFromMilli = 60 * 60 * 1000;
        return Math.floor(Math.abs(rangeEnd - rangeStart) / hourFromMilli);
    },
    formatDate: function (date) {
        var d = new Date(date);

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

        return day + ' ' + date.toLocaleString('en-NZ', { month: 'short' }) + ' ' + d.getFullYear();
    }
};


# MAHI to TOHA calulator

## Include the JS and stylsheet in your head or body section:

`<script type="text/javascript" src="toha-calculator.js"></script>`
`<link rel="stylesheet" href="toha-calculator.css">`

You can replace `toha-calculator.css` with `toha-calculator-unstyled.css` if you prefer to use a minimal stylesheet and apply your own styling.

## Create an element in your HTML to attach the calulator to:

`<div id="calc"></div>`

## Create a new instance of the calulator in JS:
`var tc = new TohaCalulator('calc': elementId, true: enableChart);`

 elementId: Id of the element to attach the calculator to.
 enableChart: boolean to show or hide the ChartJS chart.

If you intend to enable the chart, be sure include both ChartJS and the annotations plugin scripts. Eg:
```
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/chartjs-plugin-annotation/3.0.1/chartjs-plugin-annotation.min.js" ></script>
```
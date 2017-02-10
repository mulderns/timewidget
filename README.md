# timewidget
HTML5 Time and time span selection widget using canvas. See [demo here](http://www.students.tut.fi/~kortesmv/timewidget/).

## Current status
- alpha
- drawing and selecting mechanics
- outputs into hidden input field
- selection doesn't work intuitively

Features:
- scales both to small and big nicely.
- snap to 1, 5, 10, 15, 20 or 30 minutes
- optimize drawing
- colors and snap in options

Todo:
- output both beginning and end
- multiple timespans
(- colors from css)
- make snap widget specific
- fix sector shading
- draw guides for snap
- 24h range for selection

Depencies:
- jQuery or Zepto

## Usage

Use `x-timewidget` -tag in html. This will be filled with the timewidget. You can choose the size by specifying width in css.

```html
<x-timewidget style="width: 3em;"></x-timewidget>
```

Load time-widget.js in the html file and call `timewidget.activate()` to create the widgets.

````html
<script src="lib/zepto.min.js"></script>
<script src="js/time-widget.js"></script>

<script type="text/javascript">
$(document).ready(function() {
  console.debug("ready");
  timewidget.activate();
});
</script>
```

Also add the timewidget css for styling.
```html
<link rel="stylesheet" href="css/timewidget.css">
```

# timewidget
HTML5 Time and time span selection widget using canvas

## Current status
- alpha
- drawing and selecting mechanics
- outputs into hidden input field

Todo:
- snap to 1, 5, 10, 15, 20 or 30 minutes
- multiple timespans
- colors from css

Depencies:
- jQuery or Zepto

## usage

Use `x-timewidget` -tag in html. This will be filled with the timewidget. You can choose the size by specifying width in css.

```html
<x-timewidget style="width: 3em;"></x-timewidget>
```

Load time-widget.js in the html file and call `timewidget.activate()` to create the widgets.

````html
<script type="text/javascript">
$(document).ready(function() {
  console.debug("ready");
  timewidget.activate();
});
</script>
```

# X-Ray CSS

## Installation

`npm install --save-dev xray-css`

## Purpose

CSS code, like JavaScript code, changes all the time. Many attempts at
verifying changes don't cause unwanted effects are brittle. We can unit test
CSS visually at a component level though to great effect.

## How

We want to unit test CSS visually. Let's break that last statement down:

**unit test** CSS visually

Unit testing code using *small, controlled* test cases can be very effective
compared to full integration tests. Integration tests suffer from false
positives when someone tweaks some text. Unit tests on the other hand keep
their environment controlled and won't newly break if your home page changes.
For example, say you want to test your buttons:

button.css:

```css
button {
  background-color: blue;
  border-radius: 3px;
  color: white;
  min-width: 50rem;
  max-width: 200rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

button[disabled] {
  background-color: gray;
  color: lightgray;
}
```

We start by simply enumerating the cases we care about (short text, long text,
disabled).

button.html:

```html
<link href="button.css" rel="stylesheet"/>

<example title="a simple button">
  <button>Short</button>
</example>

<example title="long text">
  <button>Some really long text that could happen, you know?</button>
</example>

<example title="disabled">
  <button disabled>Disabled</button>
</example>
```

Now, when we run xray-css for the first time, it'll generate an expected
screenshot of **just this unit test**. If you were to run it again, you'd
expect the screenshot to stay the same. Now if someone were to come along and
change the `min-width` of a button, xray-css would fail to compare correctly
against the last screenshot. If someone were to change a button on your home
page though, this unit test would not be affected: your buttons are likely
still all-ok CSS-wise.

In this way of **unit testing** CSS, we can avoid false positives in unreleated
changes in how our CSS is used.

unit test **CSS** visually

Using a pre- or post-processor? That's cool (if not, you should be). Since xray-css only cares about the end result and rendering a unit test page, it's agnostic to your current toolchain. To help you with your processing though, it knows how to generate the resulting CSS for inclusion into the test page.

unit test CSS **visually**

Some concepts of unit testing CSS try to use the expected computed CSS values
as their expected result. We've noticed this also can generate false positives
when someone changes both `padding` and `margin`. Generally, we only care
about the output, which we consider to be the visual look of the page. Since
we're doing screenshot diffing, tweaking related values that would result in
identical visuals is fine.

## Tactics

CSS can cover a lot of states. Here are a few ways to deal with them all.

### :hover

### :active

### transitions

https://css-tricks.com/controlling-css-animations-transitions-javascript/

### animations

`animation-play-state: paused`

https://css-tricks.com/controlling-css-animations-transitions-javascript/

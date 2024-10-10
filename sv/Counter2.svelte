<script>
	import { count } from "./store"

	/** @param {MouseEvent} event */
	function handleClick(event) {
		$count -= 1;
	}
</script>

<button on:click={handleClick}>
	count: {$count + 10}
</button>

<style>
	button {
		background: lightgreen
	}
</style>

<script>
	import { count } from "./store"

	/** @param {MouseEvent} event */
	function handleClick(event) {
		$count += 1;
	}
</script>

<button on:click={handleClick}>
	count: {$count}
</button>

<style>
	button {
		background: lightblue
	}
</style>

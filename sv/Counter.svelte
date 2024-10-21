<script>
    import { onMount } from "svelte";
	import { count } from "./store"
	let text = "";
	/** @param {MouseEvent} event */
	function handleClick(event) {
		$count += 1;
	}

	onMount(() => {
		text = "Hydrated";
		setTimeout(() => {
			text += " and timer!"
		}, 2000);
	})
</script>

<button on:click={handleClick}>
	count: {$count}

	- {text}
</button>

<style>
	button {
		background: lightblue
	}
</style>

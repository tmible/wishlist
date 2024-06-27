<script>
  import CalendarIcon from "svelte-radix/Calendar.svelte";
  import { DateFormatter, getLocalTimeZone } from "@internationalized/date";
  import { cn } from "$lib/components/ui/utils.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { RangeCalendar } from "$lib/components/ui/range-calendar/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";

  const df = new DateFormatter("ru-RU", { dateStyle: "medium" });

  export let value = undefined;

  let className = undefined;
  export { className as class };

  let startValue = undefined;
</script>

<Popover.Root openFocus>
  <Popover.Trigger asChild let:builder>
    <Button
      variant="outline"
      class={cn(
        "w-[300px] justify-start text-left font-normal",
        !value && "text-muted-foreground",
        className
      )}
      builders={[builder]}
    >
      <CalendarIcon class="mr-2 h-4 w-4" />
      {#if value && value.start}
        {#if value.end}
          {df.format(value.start.toDate(getLocalTimeZone()))} - {df.format(
            value.end.toDate(getLocalTimeZone())
          )}
        {:else}
          {df.format(value.start.toDate(getLocalTimeZone()))}
        {/if}
      {:else if startValue}
        {df.format(startValue.toDate(getLocalTimeZone()))}
      {:else}
        Даты
      {/if}
      <slot />
    </Button>
  </Popover.Trigger>
  <Popover.Content class="w-auto p-0" align="start">
    <RangeCalendar
      bind:value
      bind:startValue
      placeholder={value?.start}
      initialFocus
      numberOfMonths={2}
      locale="ru-RU"
    />
  </Popover.Content>
</Popover.Root>

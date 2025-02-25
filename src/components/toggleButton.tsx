import { useCheckbox, Chip, VisuallyHidden, tv } from "@heroui/react";
import { IconCheck } from "@tabler/icons-react";

type PropType = {
  name: string;
  onClick: () => void;
  isSelected: boolean;
}

const ToggleButton = (props: PropType) => {
  const { name, onClick } = props;

  const { children, isSelected, isFocusVisible, getBaseProps, getLabelProps, getInputProps } =
    useCheckbox({
      defaultSelected: props.isSelected,
    });

  const checkbox = tv({
    slots: {
      base: "border-default hover:bg-default-200",
      content: "text-default-500",
    },
    variants: {
      isSelected: {
        true: {
          base: "border-primary bg-primary hover:bg-primary-500 hover:border-primary-500",
          content: "text-primary-foreground pl-1",
        },
      },
      isFocusVisible: {
        true: {
          base: "outline-none ring-2 ring-focus ring-offset-2 ring-offset-background",
        },
      },
    },
  });

  const styles = checkbox({ isSelected, isFocusVisible });

  return (
    <label {...getBaseProps()} onClick={onClick}>
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>
      {/* @ts-ignore Component isn't typesafe */}
      <Chip
        classNames={{
          base: styles.base(),
          content: styles.content(),
        }}
        color="primary"
        startContent={isSelected ? <IconCheck className="ml-1 text-white" /> : null}
        variant="faded"
        {...getLabelProps()}
      >
        {name}
      </Chip>
    </label>
  );
}

export default ToggleButton;
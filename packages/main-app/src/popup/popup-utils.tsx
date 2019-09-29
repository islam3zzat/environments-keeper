import React from "react";

export interface IEnvironment {
  name: string;
  url: string;
}

export const useActiveTab = () => {
  const [activeTab, setActiveTab] = React.useState();
  React.useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      setActiveTab(tabs[0]);
    });
  }, []);
  return activeTab;
};

const useSendMessage = (activeTab?: { id: number }) => {
  if (!activeTab) {
    return () => {
      // noop
    };
  }
  return (message: any, callback?: (response: any) => void) =>
    chrome.tabs.sendMessage(activeTab.id, message, callback);
};

export const useActionHandlers = (
  updateEnveironmentsCallback?: (enveironments: IEnvironment[]) => void
) => {
  const [enveironments, setEnveironments] = React.useState<IEnvironment[]>([]);
  const activeTab = useActiveTab();
  const sendMessage = useSendMessage(activeTab);

  const saveLocalEnveironments = (nextEnveironments: IEnvironment[] = []) => {
    setEnveironments(nextEnveironments);
    if (updateEnveironmentsCallback) {
      updateEnveironmentsCallback(nextEnveironments);
    }
  };

  const commitEnveironments = (nextEnveironments: IEnvironment[]) =>
    sendMessage(
      {
        type: "save-enveironments",
        enveironments: nextEnveironments
      },
      (response: { enveironments: IEnvironment[] }) => {
        saveLocalEnveironments(response.enveironments);
      }
    );
  const onSubmit = (nextEnveironment: { name: string; url: string }) => {
    commitEnveironments([...enveironments, nextEnveironment]);
  };
  const deleteEnveironment = (enveironmentName: string) => {
    commitEnveironments(
      enveironments.filter(({ name }) => enveironmentName !== name)
    );
  };
  return {
    onSubmit,
    deleteEnveironment,
    commitEnveironments,
    enveironments,
    saveLocalEnveironments
  };
};
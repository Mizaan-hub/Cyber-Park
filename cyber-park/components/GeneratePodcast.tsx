import { GeneratePodcastProps } from "@/types";
import React, { useState } from "react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Loader } from "lucide-react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { v4 as uuidv4 } from "uuid";
import { useUploadFiles } from "@xixixao/uploadstuff/react";
import { useToast } from "./ui/use-toast";

const useGeneratePodcast = ({
  setAudio,
  voiceType,
  voicePrompt,
  setAudioStorageId,
}: GeneratePodcastProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const getPodcastAudio = useAction(api.openai.generateAudioAction);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getAudioUrl = useMutation(api.podcasts.getUrl);

  const { startUpload } = useUploadFiles(generateUploadUrl);

  const generatePodcast = async () => {
    setIsGenerating(true);
    setAudio("");

    if (!voicePrompt) {
      toast({
        title: "Please enter a voice prompt",
      });
      return setIsGenerating(false);
    }

    try {
      const response = await getPodcastAudio({
        voice: voiceType,
        input: voicePrompt,
      });

      const blob = new Blob([response], { type: "audio/mpeg" });
      const fileName = `podcast-${uuidv4()}.mp3`;
      const file = new File([blob], fileName, {
        type: "audio/mpeg",
      });

      const uploaded = await startUpload([file]);
      const storageId = (uploaded[0].response as any).storageId;
      setAudioStorageId(storageId);

      const audioUrl = await getAudioUrl({ storageId });
      setAudio(audioUrl!);
      setIsGenerating(false);
      toast({
        title: "Podcast generated successfully!",
      });
    } catch (error) {
      console.log("Error Generating Podcast", error);
      toast({
        title: "Error Creating A Podcast",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };
  return {
    isGenerating,
    generatePodcast,
  };
};

const GeneratePodcast = (props: GeneratePodcastProps) => {
  const { isGenerating, generatePodcast } = useGeneratePodcast(props);
  return (
    <div>
      <div>
        <Label className="text-16 text-white-1 font-bold">
          AI Prompt to generate Podcast
        </Label>
        <Textarea
          className="input-class font-light focus-visible:ring-offset-orange-1 mt-5"
          placeholder="Provide a test to generate audio"
          rows={5}
          value={props.voicePrompt}
          onChange={(e) => props.setVoicePrompt(e.target.value)}
        />
      </div>
      <div className="mt-5 w-full max-w-[200px]">
        <Button
          type="submit"
          onClick={generatePodcast}
          className={
            isGenerating
              ? "text-16 w-full text-white-1 bg-black-1 py-4 font-bold transition-all duration-500"
              : "text-16 text-white-1 bg-orange-1 py-4 font-bold"
          }
        >
          {isGenerating ? (
            <>
              Generating
              <Loader size={20} className="animate-spin ml-2" />
            </>
          ) : (
            "Generate"
          )}
        </Button>
      </div>
      {props.audio && (
        <audio
          controls
          src={props.audio}
          autoPlay
          className="mt-5"
          onLoadedMetadata={(e) => {
            props.setAudioDuration(e.currentTarget.duration);
          }}
        />
      )}
    </div>
  );
};

export default GeneratePodcast;

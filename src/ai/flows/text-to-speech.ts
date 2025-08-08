
'use server';
/**
 * @fileOverview A text-to-speech AI agent.
 *
 * - textToSpeech - A function that converts text to speech.
 */

import { ai } from '@/ai/genkit';
import wav from 'wav';
import { googleAI } from '@genkit-ai/googleai';
import {
    TextToSpeechInputSchema,
    type TextToSpeechInput,
    TextToSpeechOutputSchema,
    type TextToSpeechOutput
} from './text-to-speech.schema';


export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
    console.log(`Starting text-to-speech for text: "${input.text.substring(0, 40)}..."`);
    try {
        const result = await textToSpeechFlow(input);
        console.log('Text-to-speech conversion successful.');
        return result;
    } catch (error) {
        console.error('Critical error in textToSpeech:', error);
        throw new Error('Failed to convert text to speech.');
    }
}

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const writer = new wav.Writer({
        channels,
        sampleRate: rate,
        bitDepth: sampleWidth * 8,
      });

      let bufs: Buffer[] = [];
      writer.on('error', (err) => {
        console.error('Error in WAV writer:', err);
        reject(err);
      });
      
      writer.on('data', (chunk: Buffer) => {
        bufs.push(chunk);
      });
      
      writer.on('end', () => {
        try {
          const wavBuffer = Buffer.concat(bufs);
          const base64Data = wavBuffer.toString('base64');
          resolve(base64Data);
        } catch (err) {
          console.error('Error processing WAV data:', err);
          reject(new Error('Failed to process WAV data'));
        }
      });

      writer.write(pcmData);
      writer.end();
    } catch (err) {
      console.error('Error in WAV conversion:', err);
      reject(err);
    }
  });
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async (query) => {
    console.log('Executing textToSpeechFlow...');
    try {
        const { media } = await ai.generate({
          model: googleAI.model('gemini-2.5-flash-preview-tts'),
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: query.voice || 'Algenib' },
              },
            },
          },
          prompt: query.text,
        });

        if (!media) {
          throw new Error('no media returned from TTS API');
        }

        const audioBuffer = Buffer.from(
          media.url.substring(media.url.indexOf(',') + 1),
          'base64'
        );

        console.log('Converting PCM to WAV...');
        const wavData = await toWav(audioBuffer);
        console.log('WAV conversion complete.');

        return {
          media: `data:audio/wav;base64,${wavData}`,
        };
    } catch (error) {
        console.error('Error in textToSpeechFlow:', error);
        throw error;
    }
  }
);

import React, { useState } from 'react';
import { Bot, X, Loader2, AlertTriangle, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useOpenAI } from '../services/openai';
import { useSettings } from '../context/SettingsContext';
import { useNews } from '../hooks/useNews';

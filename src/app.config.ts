import {
  AppConfigClient,
  GetHostedConfigurationVersionCommand,
  ListApplicationsCommand, ListConfigurationProfilesCommand,
} from "@aws-sdk/client-appconfig";
import * as process from "process";
import * as path from "path";
import * as fs from "fs";
import * as jsYaml from "js-yaml";
import { ENV_LOCAL } from "./app.constant";

const COMMON_CONFIG_NAME = "common.sa";
const SERVICE_CONF_VERSION = "SERVICE_CONF_VERSION";
const COMMON_CONF_VERSION = "COMMON_CONF_VERSION";
const ENV_LOCAL_NAME = ".env.yaml";
const AWS_CONFIG_FILE_NAME = ".awsConfVer.yaml";
const PACKAGE_JSON_PATH = path.join(process.cwd(), "package.json");

interface IEnvironmentVersions {
  develop: number;
  staging: number;
  production: number;
}
interface IConfigVersions {
  serviceConfVersion: IEnvironmentVersions;
  commonConfVersion: IEnvironmentVersions;
}

interface IConfiguration {
  [SERVICE_CONF_VERSION]: number;
  [COMMON_CONF_VERSION]: number;
  ENV: string;
  [key: string]: any; // Allow additional properties
}

const getApplicationConfig = async (
  appName: string,
  version: number,
  env: string
) :Promise<string> => {
  try {
    const config = {
      region: process.env.AWS_REGION, // e.g., "us-west-2"
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Your AWS access key ID
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    };

    const client = new AppConfigClient([config]);
    const commandApplication = new ListApplicationsCommand({});
    const applications = await client.send(commandApplication);
    const itemApplication = applications.Items;

    if (!itemApplication) {
      throw new Error("++++++++++++++++++++++No application found+++++++++++++++++++");
    }

    const application = itemApplication.find((app) => app.Name === appName);

    if (!application) {
      throw new Error("+++++++++++++++++ No application found with the name:  ");
    }

    const commandGetProfile = new ListConfigurationProfilesCommand({
      ApplicationId: application.Id,
    });

    const profiles = await client.send(commandGetProfile);
    const listProfiles = profiles.Items;

    if (!listProfiles) {
      throw new Error("++++++++++++++++++++++++++ No profiles found for the application: ");
    }

    const profile = listProfiles.find((profile) => profile.Name === `${appName}.${env}`);

    if (!profile) {
      throw new Error("++++++++++++++++++++++++++ No profiles found for the application: ");
    }

    const commandGetHostedConfig = new GetHostedConfigurationVersionCommand({
      ApplicationId: application.Id,
      ConfigurationProfileId: profile.Id,
      VersionNumber: version,
    });

    // Send the command to AWS AppConfig and get the response
    const response = await client.send(commandGetHostedConfig);
    const textDecoder = new TextDecoder("utf-8");
    const configContent = response.Content;

    return textDecoder.decode(configContent);
  } catch (e) {
    console.log("Error: ", e);
    return "";
  }
};

const getEnvVariables = async () :Promise<IConfiguration> => {
  try {
    const configVersionsPath = path.join(process.cwd(), AWS_CONFIG_FILE_NAME);
    const configVersions = jsYaml.load(
      fs.readFileSync(configVersionsPath, "utf8")
    ) as IConfigVersions;
    const {
      serviceConfVersion,
      commonConfVersion,
    } = configVersions;

    const env = (process.env.ENV || ENV_LOCAL) as keyof IEnvironmentVersions;
    const versionCommon = commonConfVersion[env];
    const versionService = serviceConfVersion[env];

    const fileContents = fs.readFileSync(PACKAGE_JSON_PATH, "utf8");
    const packageJson = JSON.parse(fileContents);
    const packageName: string = packageJson.name;

    if (!packageName) {
      throw new Error("Package name not found in package.json");
    }
    const envLocalPath = path.join( process.cwd(), ENV_LOCAL_NAME);

    if (env === ENV_LOCAL && fs.existsSync(envLocalPath)) {
      const existConfigLocal = (
          jsYaml.loadAll(fs.readFileSync(envLocalPath, "utf-8")
          )[0] || {}) as IConfiguration;
      if (
        existConfigLocal[SERVICE_CONF_VERSION] == versionService &&
          existConfigLocal[COMMON_CONF_VERSION] == versionCommon
      ) {
        console.log("ENV already existed");
        return existConfigLocal;
      } else {
        console.log("ENV already existed but different version");
        fs.unlinkSync(envLocalPath);
      }
    }

    const [commonConfig, serviceConfig] = await Promise.all([
      getApplicationConfig(COMMON_CONFIG_NAME, versionCommon, env),
      getApplicationConfig(packageName, versionService, env),
    ]);
    // add the config to check version file env local
    const numberDeploymentCf = {
      [SERVICE_CONF_VERSION]: serviceConfVersion[env],
      [COMMON_CONF_VERSION]: commonConfVersion[env],
      ENV: env,
    };

    const numberDeploymentCfYaml = jsYaml.dump(numberDeploymentCf);
    const combinedConfig = jsYaml.loadAll(
      commonConfig + "\n" + numberDeploymentCfYaml + "\n" + serviceConfig
    ) as IConfiguration[];
    // write file env local
    if (env === ENV_LOCAL) {
      fs.writeFileSync(envLocalPath, jsYaml.dump(combinedConfig[0] ?? {}, {
        lineWidth: -1, // Disable line folding
      }));
    }
    console.log("Pull config env successfully ");
    return combinedConfig[0] ?? {} as IConfiguration;
  } catch (e) {
    console.log("Pull config env failed ", e);
    return {} as IConfiguration;
  }
};

const setEnvVariables = async (): Promise<void> => {
  const configs = await getEnvVariables() as IConfiguration;
  for (const [key, value] of Object.entries(configs)) {
    if (value !== undefined && value !== null) {
      process.env[key] = value; // Convert values to strings for environment variables
    }
  }
  console.log("Set env to process successfully");
};
export {
  setEnvVariables,
};


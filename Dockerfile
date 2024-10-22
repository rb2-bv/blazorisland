FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["blazorssrisland.csproj", "./"]
RUN dotnet restore "blazorssrisland.csproj"
COPY . .
RUN dotnet publish "blazorssrisland.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "blazorssrisland.dll"]
